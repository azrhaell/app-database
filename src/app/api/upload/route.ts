import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '../database/dbclient';

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
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object' || !('fileName' in body) || typeof body.fileName !== 'string') {
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

    if (!fileContent) {
      return NextResponse.json({ error: 'Arquivo JSON está vazio.' }, { status: 400 });
    }

    fileContent = fileContent.replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":').replace(/\uFEFF/g, '');

    let jsonData: Registro[];
    try {
      jsonData = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: 'Erro ao processar JSON. Verifique o formato do arquivo.' }, { status: 400 });
    }

    const validEntries = jsonData.filter((item: Registro) => typeof item === 'object' && Object.keys(item).length > 0);
    if (validEntries.length === 0) {
      return NextResponse.json({ error: 'Nenhum registro válido encontrado no JSON.' }, { status: 400 });
    }

    const registrosFinal: {
      cnpj: string;
      companyname: string;

      startofcontract: Date;
      mobilephone1: string;
      operatorname: string;

      state: string;
      cnaecode: string;
      cnaedescription: string;
      address: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      cep: string;
      creatorId: number;
      ddd1: string;
    }[] = [];

    for (const item of validEntries) {
      const mobile = item.N_LINHAS || item.NUMERO || item.NR_TELEFONE || '';
      const cleanedMobile = mobile.replace(/\D/g, '').slice(0, 12);
      const newStart = parseDate(item.FIDELIDADE) || parseDate(item['INICIO CONTRATO']) || new Date('1901-01-01');

      if (!cleanedMobile) continue;

      const existing = await prisma.organizations.findFirst({
        where: { mobilephone1: cleanedMobile },
        select: { idCompany: true, startofcontract: true },
      });

      if (!existing || (existing.startofcontract && newStart > existing.startofcontract)) {
        if (existing) {
          await prisma.organizations.delete({ where: { idCompany: existing.idCompany } });
        }

        registrosFinal.push({
          cnpj: (item.CNPJ || item.CNPJ_CLIENTE || '').slice(0, 14),
          companyname: (item.RAZAO_SOCIAL || item.DSNOMERAZAO || '').slice(0, 254),

          startofcontract: newStart,
          mobilephone1: cleanedMobile,
          operatorname: (item.OPERADORA || item.NOMEOPERADORA || '').slice(0, 49),

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
        });
      }
    }

    if (registrosFinal.length === 0) {
      return NextResponse.json({ message: 'Nenhum registro novo para importar.' });
    }

    await prisma.organizations.createMany({
      data: registrosFinal,
      skipDuplicates: true,
    });

    await prisma.listfiles.updateMany({
      where: { name: fileName.slice(0, -5) },
      data: { sincronized: true },
    });

    return NextResponse.json({ message: `Importação concluída com sucesso. Registros inseridos: ${registrosFinal.length}` });
  } catch (error) {
    console.error('Erro ao processar o upload:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error) || 'Erro desconhecido';
    return NextResponse.json({ error: `Erro interno no servidor: ${errorMessage}` }, { status: 500 });
  }
}
