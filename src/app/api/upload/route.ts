import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '../database/dbclient';

export const runtime = 'nodejs';

// Função para converter datas corretamente
function parseDate(dateStr: string | number | null | undefined): Date | null {
  if (!dateStr) return null;

  // Verifica se está no formato DD/MM/YYYY HH:mm
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = String(dateStr).match(dateRegex);

  if (match) {
    const [, day, month, year, hours, minutes] = match.map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  // Tenta converter diretamente
  const parsedDate = new Date(dateStr);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

interface Registro {
  CNPJ: string;
  RAZAO_SOCIAL?: string;
  DSNOMERAZAO?: string;
  FIDELIDADE?: string;
  'INICIO CONTRATO'?: string;
  N_LINHAS?: string;
  NUMERO?: string;
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
    const body = await req.json().catch(() => null); // Captura erro no parsing do JSON

    if (!body || typeof body !== 'object' || !('fileName' in body) || typeof body.fileName !== 'string') {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido ou body inválido.' }, { status: 400 });
    }

    const { fileName } = body;
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }

    let fileContent = fs.readFileSync(filePath, 'utf-8').trim();
    console.log('Primeiros caracteres do arquivo:', fileContent.slice(0, 14).split('').map(c => c.charCodeAt(0)));

    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    if (!fileContent) {
      return NextResponse.json({ error: 'Arquivo JSON está vazio.' }, { status: 400 });
    }

    let jsonData: Registro[];
    try {
      fileContent = fileContent.replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":');
      fileContent = fileContent.replace(/\uFEFF/g, '');

      jsonData = JSON.parse(fileContent);

    } catch (error) {
      console.log(error);
      return NextResponse.json({ error: 'Erro ao processar JSON. Verifique o formato do arquivo.' }, { status: 400 });
    }

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return NextResponse.json({ error: 'Formato inválido do JSON. Deve ser um array de objetos com registros.' }, { status: 400 });
    }

    //jsonData.forEach((item) => console.log(item));

    const validEntries = jsonData.filter((item: Registro) => typeof item === 'object' && Object.keys(item).length > 0);
    if (validEntries.length === 0) {
      return NextResponse.json({ error: 'Nenhum registro válido encontrado no JSON.' }, { status: 400 });
    }

    // Normaliza as chaves para evitar erros
    const normalizedData = validEntries.map((item: Registro) => {
      const newItem: Record<string, string | number | Date | null> = {};
      Object.keys(item).forEach((key) => {
        const cleanKey = key.replace(/['"\uFEFF]/g, '').trim();
        
        newItem[cleanKey] = item[cleanKey as keyof Registro] ?? null;
      });
      return newItem;
    });

    if (normalizedData.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado válido para inserir no banco.' }, { status: 400 });
    }

    //normalizedData.forEach((item) => console.log(item));

    const created = await prisma.$transaction([
      prisma.organizations.createMany({
        data: normalizedData.map((item) => ({
          cnpj: typeof item.CNPJ === 'string' ? item.CNPJ.slice(0, 14) : '',
          companyname: typeof item.RAZAO_SOCIAL === 'string' ? item.RAZAO_SOCIAL.slice(0, 254) : 
                       typeof item.DSNOMERAZAO === 'string' ? item.DSNOMERAZAO.slice(0, 254) : '',
          startofcontract: typeof item.FIDELIDADE === 'string' || typeof item.FIDELIDADE === 'number' ? 
          parseDate(item.FIDELIDADE) : 
          typeof item['INICIO CONTRATO'] === 'string' || typeof item['INICIO CONTRATO'] === 'number' ?
          parseDate(item['INICIO CONTRATO']) : 
          new Date('1901-01-01 00:00:00'),
          mobilephone1: typeof item.N_LINHAS === 'string' ? item.N_LINHAS.slice(0, 12) : typeof item.NUMERO === 'string' ? item.NUMERO.slice(0, 12) : '',
          operatorname: typeof item.OPERADORA === 'string' ? item.OPERADORA.slice(0, 49) : typeof item.NOMEOPERADORA === 'string' ? item.NOMEOPERADORA.slice(0, 49) : '',
          state: typeof item.UF === 'string' ? item.UF.slice(0, 2) : typeof item.DSUF === 'string' ? item.DSUF.slice(0, 2) : '',
          cnaecode: typeof item.CNAE === 'string' ? item.CNAE.slice(0, 10) : '',
          cnaedescription: typeof item.DESCRICAO_CNAE === 'string' ? item.DESCRICAO_CNAE.slice(0, 255) : '',
          address: typeof item.DSENDERECO === 'string' ? item.DSENDERECO.slice(0, 99) : '',
          number: typeof item.DSNUMERO === 'string' ? item.DSNUMERO.slice(0, 19) : '',
          complement: typeof item.DSCOMPLEMENTO === 'string' ? item.DSCOMPLEMENTO.slice(0, 49) : '',
          neighborhood: typeof item.DSBAIRRO === 'string' ? item.DSBAIRRO.slice(0, 49) : '',
          city: typeof item.DSCIDADE === 'string' ? item.DSCIDADE.slice(0, 29) : '',
          cep: typeof item.CEP === 'string' ? item.CEP.slice(0, 8) : typeof item.DSCEP === 'string' ? item.DSCEP.slice(0, 8) : '',
          creatorId: 1, // POR ENQUANTO, SEMPRE 1
          ddd1: typeof item.UF === 'string' ? item.UF.slice(0, 2) : typeof item.DSUF === 'string' ? item.DSUF.slice(0, 2) : '',
        })),
        skipDuplicates: true,
      }),
    ]);

    console.log('Registros inseridos:', created);

    await prisma.listfiles.updateMany({
      where: {
        name: fileName.slice(0, -5),
      },
      data: {
        sincronized: true,
      },
    });

    return NextResponse.json({ message: `Arquivo ${fileName} importado com sucesso!` });
  } catch (error) {
    console.log('Tipo do erro:', typeof error);
    console.log('Erro JSON:', JSON.stringify(error, null, 2));
    console.error('Erro ao processar o upload:', error);

    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error) || 'Erro desconhecido';

    return NextResponse.json({ error: `Erro interno no servidor: ${errorMessage}` }, { status: 500 });
  }
}
