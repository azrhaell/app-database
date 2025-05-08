import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '../database/dbclient';
import pLimit from 'p-limit';

export const runtime = 'nodejs';

function parseDate(dateStr: string | number | null | undefined): Date | null {
  if (!dateStr) return null;
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = String(dateStr).match(dateRegex);
  if (match) {
    const [, day, month, year, hours, minutes] = match.map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
  const parsedDate = new Date(dateStr);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

interface Registro {
  CNPJ: string;
  CNPJ_CLIENTE: string;
  RAZAO_SOCIAL?: string;
  DSNOMERAZAO?: string;
  FIDELIDADE?: string;
  DTINSTALACAO?: string;
  'INICIO CONTRATO'?: string;
  N_LINHAS?: string;
  NUMERO?: string;
  NR_TELEFONE?: string;
  OPERADORA?: string;
  NOMEOPERADORA?: string;
  UF?: string;
  DSUF?: string;
  CNAE?: string;
  DESCRICAO_CNAE?: string;
  DSENDERECO?: string;
  DSNUMERO?: string;
  DSCOMPLEMENTO?: string;
  DSBAIRRO?: string;
  DSCIDADE?: string;
  CEP?: string;
  DSCEP?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    if (!body || typeof body.fileName !== 'string') {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido ou body inválido.' }, { status: 400 });
    }

    const { fileName } = body;
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }

    let fileContent = fs.readFileSync(filePath, 'utf-8').trim();
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }

    fileContent = fileContent.replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":').replace(/\uFEFF/g, '');

    let jsonData: Registro[];
    try {
      jsonData = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: 'Erro ao processar JSON. Verifique o formato do arquivo.' }, { status: 400 });
    }

    const registrosValidos = jsonData.filter(item => typeof item === 'object' && Object.keys(item).length > 0);

    const cnpjMap = new Map<string, number>();
    const seenCnpjs = new Set<string>();
    const limit = pLimit(10); // máximo 10 promessas simultâneas

    const numerosComErro: string[] = [];

    // Etapa 1: processar organizations
    await Promise.all(registrosValidos.map(item =>
      limit(async () => {
        const cnpj = (item.CNPJ || item.CNPJ_CLIENTE || '').slice(0, 14);
        if (!cnpj || seenCnpjs.has(cnpj)) return;
        seenCnpjs.add(cnpj);

        const companyname = (item.RAZAO_SOCIAL || item.DSNOMERAZAO || '').slice(0, 254);

        const org = await prisma.organizations.upsert({
          where: { cnpj },
          update: {
            companyname,
            state: (item.UF || item.DSUF || '').slice(0, 2),
            cnaecode: (item.CNAE || '').slice(0, 10),
            cnaedescription: (item.DESCRICAO_CNAE || '').slice(0, 255),
            address: (item.DSENDERECO || '').slice(0, 99),
            number: (item.DSNUMERO || '').slice(0, 19),
            complement: (item.DSCOMPLEMENTO || '').slice(0, 49),
            neighborhood: (item.DSBAIRRO || '').slice(0, 49),
            city: (item.DSCIDADE || '').slice(0, 29),
            cep: (item.CEP || item.DSCEP || '').slice(0, 8),
            creatorId: 1,
            ddd1: (item.UF || item.DSUF || '').slice(0, 2),
          },
          create: {
            cnpj,
            companyname,
            state: (item.UF || item.DSUF || '').slice(0, 2),
            cnaecode: (item.CNAE || '').slice(0, 10),
            cnaedescription: (item.DESCRICAO_CNAE || '').slice(0, 255),
            address: (item.DSENDERECO || '').slice(0, 99),
            number: (item.DSNUMERO || '').slice(0, 19),
            complement: (item.DSCOMPLEMENTO || '').slice(0, 49),
            neighborhood: (item.DSBAIRRO || '').slice(0, 49),
            city: (item.DSCIDADE || '').slice(0, 29),
            cep: (item.CEP || item.DSCEP || '').slice(0, 8),
            creatorId: 1,
            ddd1: (item.UF || item.DSUF || '').slice(0, 2),
          },
        });
        cnpjMap.set(cnpj, org.idCompany);
      })
    ));

    // Etapa 2: processar numbers
    let registrosInseridos = 0;

    await Promise.all(registrosValidos.map(item =>
      limit(async () => {
        const cnpj = (item.CNPJ || item.CNPJ_CLIENTE || '').slice(0, 14);
        const idCompany = cnpjMap.get(cnpj);
        const mobileRaw = item.N_LINHAS || item.NUMERO || item.NR_TELEFONE || '';
        const mobilephone1 = mobileRaw.replace(/\D/g, '').slice(0, 13);
        const startofcontract = parseDate(item.FIDELIDADE) || parseDate(item['INICIO CONTRATO']) || parseDate(item.DTINSTALACAO) || new Date('1901-01-01');
        const operatorname = (item.OPERADORA || item.NOMEOPERADORA || '').slice(0, 50);

        if (!mobilephone1 || !idCompany) return;

        try {
          await prisma.numbers.create({
            data: { mobilephone1, startofcontract, operatorname, idCompany },
          });
          registrosInseridos++;
        } catch (err: unknown) {
          if ((err as { code?: string })?.code === 'P2002') {
            const existing = await prisma.numbers.findUnique({ where: { mobilephone1 } });
            if (
              existing &&
              existing.startofcontract &&
              startofcontract > existing.startofcontract
            ) {
              await prisma.numbers.update({
                where: { idNumber: existing.idNumber },
                data: { startofcontract, operatorname, idCompany },
              });
              registrosInseridos++;
            } else {
              numerosComErro.push(mobilephone1);
            }
          } else {
            console.error('Erro ao inserir número:', err);
          }
        }
      })
    ));

    await prisma.listfiles.updateMany({
      where: { name: fileName.slice(0, -5) },
      data: { sincronized: true },
    });

    return NextResponse.json({
      message: `Importação concluída com sucesso. Registros inseridos/atualizados: ${registrosInseridos}`,
      numerosComErro,
    });

  } catch (error) {
    console.error('Erro ao processar o upload:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error) || 'Erro desconhecido';
    return NextResponse.json({ error: `Erro interno no servidor: ${errorMessage}` }, { status: 500 });
  }
}
