import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const operatorsByStateRaw = await prisma.organizations.groupBy({
      by: ['state', 'operatorname'],
      where: { operatorname: { not: '' } },
    });

    // Agrupar operadores únicos por estado
    const operatorsByStateCount = operatorsByStateRaw.reduce((acc, { state }) => {
      if (state) {
        acc[state] = (acc[state] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const operatorsByState = Object.entries(operatorsByStateCount).map(([state, count]) => ({
      state,
      count,
    }));

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      operatorsByState,
          });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}