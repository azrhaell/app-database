import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET(req: NextRequest, { params }: { params: { operatorname: string } }) {
  // Extrai o caminho da URL
  const pathname = req.nextUrl.pathname;

  // Divide a URL para pegar o último segmento (o nome da operadora)
  const segments = pathname.split('/');
  const operatorname = segments[segments.length - 1];

  if (!operatorname || operatorname === "[operatorname]") {
    return NextResponse.json({ error: "Operadora não especificada" }, { status: 400 });
  }

  try {
    const lines = await prisma.organizations.findMany({
      where: {
        operatorname,
      },
      select: {
        cnpj: true,
        companyname: true,
        startofcontract: true,
        mobilephone1: true,
        city: true,
        state: true,
        operatorname: true,
      },
      take: 50,
    });

    return NextResponse.json(lines);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar linhas da operadora' }, { status: 500 });
  }
}
