import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Traz apenas números ativos com operadora e empresa associada
    const numbersWithState = await prisma.numbers.findMany({
      where: {
        operatorname: { not: null },
        relatedcompany: {
          state: { not: null },
        },
      },
      select: {
        operatorname: true,
        relatedcompany: {
          select: {
            state: true,
          },
        },
      },
    });

    // Agrupa por estado > operadora
    const counts: Record<string, Record<string, number>> = {};

    for (const record of numbersWithState) {
      const state = record.relatedcompany?.state?.trim().toUpperCase() || 'n/d';
      const operator = record.operatorname?.trim() || 'Desconhecida';

      if (!counts[state]) counts[state] = {};
      counts[state][operator] = (counts[state][operator] || 0) + 1;
    }

    // Seleciona a operadora com maior número por estado
    const maxOperatorByState = Object.entries(counts).map(([state, ops]) => {
      const [topOperator] = Object.entries(ops).reduce((a, b) => (b[1] > a[1] ? b : a));
      return { state, operatorname: topOperator };
    });

    return NextResponse.json({ maxOperatorByState });
  } catch (error) {
    console.error('Erro ao buscar operadoras por estado:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
