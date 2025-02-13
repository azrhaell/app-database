import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs'; // Define o ambiente Node.js para permitir operações de arquivo

const prisma = new PrismaClient();

// Método POST para importar JSON para o PostgreSQL
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifica se o body e fileName foram recebidos
    if (!body || !body.fileName) {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido ou body inválido.' }, { status: 400 });
    }

    const { fileName } = body;
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }

    // Lê o conteúdo do arquivo e verifica se não está vazio
    const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
    if (!fileContent) {
      return NextResponse.json({ error: 'Arquivo JSON está vazio.' }, { status: 400 });
    }

    // Faz o parsing do JSON com tratamento de erro
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: 'Erro ao processar JSON. Verifique o formato do arquivo.' }, { status: 400 });
    }

    // Verifica se o JSON é um array de objetos
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return NextResponse.json({ error: 'Formato inválido do JSON. Deve ser um array de objetos com registros.' }, { status: 400 });
    }

    // Verifica se cada objeto tem pelo menos um campo
    const validEntries = jsonData.filter((item) => typeof item === 'object' && Object.keys(item).length > 0);
    if (validEntries.length === 0) {
      return NextResponse.json({ error: 'Nenhum registro válido encontrado no JSON.' }, { status: 400 });
    }

    // 🛠️ LOGS PARA DEBUG
    console.log('Registros prontos para inserção:', JSON.stringify(validEntries, null, 2));
    // Insere os dados no banco de dados com Prisma
    console.log(`Inserindo registros no banco de dados...\n${typeof validEntries} ${validEntries.length}`);
        // Insere os dados no banco de dados com Prisma
        const created = await prisma.organizations.createMany({
          data: validEntries.map((item: {
            CNPJ?: string;
            RAZAO_SOCIAL?: string;
            FIDELIDADE?: string;
            N_LINHAS?: string;
            OPERADORA?: string;
            UF?: string;
            
            DSNOMERAZAO?: string;
            'INICIO CONTRATO'?: string;
            NUMERO?: string;
            NOMEOPERADORA?: string;
            CNAE?: string;
            DESCRICAO_CNAE?: string;
            DSENDERECO?: string;
            //DSTIPO?: string;
            //DSTITULO?: string;
            //DSLOGRADOURO?: string;
            DSNUMERO?: string;
            DSCOMPLEMENTO?: string;
            DSBAIRRO?: string;
            DSCIDADE?: string;
            DSUF?: string;
            DSCEP?: string;
            CEP?: string;
          }) => {
            // Mapeia os campos do seu JSON para os campos do modelo Organizations
            return {
              cnpj: (item.CNPJ || ''), // Certifique-se de usar os nomes de campo corretos do seu modelo Prisma
              companyname: (item.RAZAO_SOCIAL || item.DSNOMERAZAO || ''),
              startofcontract: (item.FIDELIDADE ? new Date(item.FIDELIDADE) : (item['INICIO CONTRATO'] ? new Date(item['INICIO CONTRATO']) : null)),
              mobilephone1: (item.N_LINHAS || item.NUMERO ||''),
              operatorname: (item.OPERADORA || item.NOMEOPERADORA ||''),
              state: (item.UF || item.DSUF || ''),
              cnaecode: (item.CNAE || ''),
              cnaedescription: (item.DESCRICAO_CNAE || ''),
              address: (item.DSENDERECO || ''),
              //address_type: (item.DSTIPO || ''),
              //dstitle: (item.DSTITULO || ''),
              //street: (item.DSLOGRADOURO || ''),
              number: (item.DSNUMERO || ''),
              complement: (item.DSCOMPLEMENTO || ''),
              neighborhood: (item.DSBAIRRO || ''),
              city: (item.DSCIDADE || ''),
              cep: (item.CEP || item.DSCEP || ''),
              creatorId: 1, // POR ENQUANTO, SEMPRE 1
              ddd1: ""
            };
          }),
          skipDuplicates: true, // Evita registros duplicados
        });
    
        console.log('Registros inseridos:', created);

    return NextResponse.json({ message: `Arquivo ${fileName} importado com sucesso!` });
  } catch (error) {
    console.error('Erro ao processar o upload:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
