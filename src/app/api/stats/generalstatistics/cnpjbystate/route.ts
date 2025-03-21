import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const cnpjsByStateRaw = await prisma.organizations.findMany({
        distinct: ['cnpj'],
        select: { state: true, cnpj: true },
      });

    // Contar CNPJs únicos por estado
    const cnpjsByState = Object.entries(
        cnpjsByStateRaw.reduce((acc, { state }) => {
          if (state) {
            acc[state] = (acc[state] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      ).map(([state, count]) => ({ state, count }));

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
        cnpjsByState,
          });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}