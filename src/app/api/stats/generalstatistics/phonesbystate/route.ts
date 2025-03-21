import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const phonesByState = await prisma.organizations.groupBy({
      by: ['state'],
      _count: { mobilephone1: true },
    });

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      phonesByState: phonesByState.map(({ state, _count }) => ({
        state,
        count: _count.mobilephone1,
      })),
          });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}