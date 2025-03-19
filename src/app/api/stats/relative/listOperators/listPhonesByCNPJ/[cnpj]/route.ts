import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET(req: NextRequest, { params }: { params: { cnpj?: string } }) {
    // Extrai o caminho da URL
    const pathname = req.nextUrl.pathname;

    // Divide a URL para pegar o último segmento (o nome da operadora)
    const segments = pathname.split('/');
    const cnpj = segments[segments.length - 1];

    if (!cnpj || cnpj === "[cnpj]") {
        return NextResponse.json({ error: "CNPJ não especificado" }, { status: 400 });
    }
  try {
    //const { cnpj } = params;

    if (!cnpj) {
      return NextResponse.json({ error: 'CNPJ não especificado' }, { status: 400 });
    }

    // Buscar os telefones associados ao CNPJ na tabela "organizations"
    const phones = await prisma.organizations.findMany({
      where: { cnpj },
      select: {
        companyname: true,
        mobilephone1: true,
        startofcontract: true,
        operatorname: true,
        city: true,
        state: true,
      },
    });

    if (!phones || phones.length === 0) {
      return NextResponse.json({ message: 'Nenhum telefone encontrado para este CNPJ' }, { status: 404 });
    }

    return NextResponse.json(phones);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
