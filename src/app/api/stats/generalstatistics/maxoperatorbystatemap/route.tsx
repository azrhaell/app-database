import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Busca todos os números com o estado da organização associada
    const numbersWithState = await prisma.numbers.findMany({
      where: {
        disabled: false,
        operatorname: {
          not: null,
        },
        // Removido o filtro por estado aqui — faremos isso manualmente
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

    // Agrupamento em memória: { [state]: { [operatorname]: count } }
    const stateOperatorCount: Record<string, Record<string, number>> = {};

    for (const record of numbersWithState) {
      const state = record.relatedcompany?.state?.trim() || 'n/d';
      const operator = record.operatorname?.trim() || 'Desconhecida';

      if (!stateOperatorCount[state]) {
        stateOperatorCount[state] = {};
      }

      stateOperatorCount[state][operator] = (stateOperatorCount[state][operator] || 0) + 1;
    }

    // Determinar a operadora com maior número por estado
    const maxOperatorByState = Object.entries(stateOperatorCount).map(([state, operatorCounts]) => {
      const [topOperator] = Object.entries(operatorCounts).reduce(
        (maxEntry, currentEntry) =>
          currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry
      );

      return {
        state,
        operatorname: topOperator,
      };
    });

    return NextResponse.json({ maxOperatorByState });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
