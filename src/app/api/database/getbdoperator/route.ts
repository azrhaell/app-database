//Obter "operatorname" da tabela operators

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    // Buscar nomes da tabela legalnatures
    const fetchListOperators = await prisma.operators.findMany({
      select: {
        name: true,
        codeoperador: true,
        codeantel: true,
      },
    });

    // Retornar os nomes únicos
    const uniqueOperators = fetchListOperators.map(ln => ln.name);

    return NextResponse.json(uniqueOperators);
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error);
    return NextResponse.json({ error: 'Erro ao buscar operadoras' }, { status: 500 });
  }
}