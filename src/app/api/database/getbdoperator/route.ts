import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    const fetchListOperators = await prisma.operators.findMany({
      select: {
        name: true,
        codeoperador: true,
        codeantel: true,
      },
    });

    // Filtra e remove valores nulos/vazios, e trim nos nomes
    const uniqueOperators = fetchListOperators
      .map(op => op.name?.trim())
      .filter(name => name && name.length > 0);

    return NextResponse.json(uniqueOperators);
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error);
    return NextResponse.json({ error: 'Erro ao buscar operadoras' }, { status: 500 });
  }
}
