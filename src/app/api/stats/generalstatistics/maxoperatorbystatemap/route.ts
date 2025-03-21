import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const phonesByOperatorStateRaw = await prisma.organizations.groupBy({
      by: ['state', 'operatorname'],
      _count: { mobilephone1: true },
    });

    // Determinar a maior operadora por estado
    
    const maxOperatorByStateMap = phonesByOperatorStateRaw.reduce((acc, { state, operatorname, _count }) => {
      if (!acc[state] || _count.mobilephone1 > acc[state]._count.mobilephone1) {
        acc[state] = { state, operatorname, _count };
      }
      return acc;
    }, {} as Record<string, { state: string; operatorname: string; _count: { mobilephone1: number } }>);

    const maxOperatorByState = Object.values(maxOperatorByStateMap).map(({ state, operatorname }) => ({
      state,
      operatorname,
    }));

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      maxOperatorByState,
          });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}