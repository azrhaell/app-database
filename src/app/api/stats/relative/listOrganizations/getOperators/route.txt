import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const operators = await prisma.organizations.findMany({
      select: { operatorname: true },
      distinct: ['operatorname'], // Retorna apenas valores únicos
    });

    return NextResponse.json({ operators: operators.map(op => op.operatorname) });
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error);
    return NextResponse.json({ error: 'Erro ao buscar operadoras' }, { status: 500 });
  }
}
