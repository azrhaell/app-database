import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const operators = await prisma.operators.findMany({
      select: {
        name: true,
        description: true,
        codeoperador: true,
        codeantel: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(operators);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro ao buscar operadoras' },
      { status: 500 }
    );
  }
}
