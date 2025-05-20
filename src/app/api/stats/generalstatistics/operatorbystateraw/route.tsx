import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Consultar todas as combinações de estado e operadora a partir da tabela organizations e seus números relacionados
    const organizations = await prisma.organizations.findMany({
      where: {
        relatednumbers: {
          some: {
            operatorname: {
              not: '',
            },
          },
        },
      },
      select: {
        state: true,
        relatednumbers: {
          select: {
            operatorname: true,
          },
        },
      },
    });

    // Criar um conjunto de operadoras únicas por estado
    const stateOperatorMap: Record<string, Set<string>> = {};

    for (const org of organizations) {
      const state = org.state || 'n/d';
      if (!stateOperatorMap[state]) {
        stateOperatorMap[state] = new Set();
      }
      for (const number of org.relatednumbers) {
        if (number.operatorname && number.operatorname.trim() !== '') {
          stateOperatorMap[state].add(number.operatorname);
        }
      }
    }

    const operatorsByState = Object.entries(stateOperatorMap).map(([state, operatorSet]) => ({
      state,
      count: operatorSet.size,
    }));

    return NextResponse.json({
      operatorsByState,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de operadoras por estado:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
