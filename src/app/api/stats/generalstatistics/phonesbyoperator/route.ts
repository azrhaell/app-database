import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const phonesByOperator = await prisma.organizations.groupBy({
      by: ['operatorname'],
      _count: { mobilephone1: true },
    });

    // Encontrar a operadora com mais linhas no total
    const maxPhonesByOperator = phonesByOperator.reduce((max, item) => {
      return item._count.mobilephone1 > (max?._count.mobilephone1 || 0) ? item : max;
    }, null as { operatorname: string | null; _count: { mobilephone1: number } } | null);

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      
      phonesByOperator: phonesByOperator
      .filter(({ operatorname }) => operatorname !== null && operatorname !== '')
      .map(({ operatorname, _count }) => ({
        operatorname,
        count: _count.mobilephone1,
      })),
      maxPhonesByOperator: maxPhonesByOperator
      ? { operatorname: maxPhonesByOperator.operatorname, count: maxPhonesByOperator._count.mobilephone1 }
      : null,
        });

  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}