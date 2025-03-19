//Obter "operatorname" da tabela operators

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    // Buscar nomes da tabela states
    const fetchListCompanySizes = await prisma.companysizes.findMany({
      select: {
        name: true,
      },
    });

    // Retornar os nomes únicos
    const uniqueCompanySizes = fetchListCompanySizes.map(ln => ln.name);

    return NextResponse.json(uniqueCompanySizes);
  } catch (error) {
    console.error('Erro ao buscar Portes da Empresa:', error);
    return NextResponse.json({ error: 'Erro ao buscar Portes da Empresa' }, { status: 500 });
  }
}