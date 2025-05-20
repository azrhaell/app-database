import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Agrupar por nome da operadora e contar a quantidade de números
    const grouped = await prisma.numbers.groupBy({
      by: ['operatorname'],
      _count: {
        mobilephone1: true,
      },
    });

    // Filtrar operadoras válidas (não nulas ou vazias)
    const phonesByOperator = grouped
      .filter(({ operatorname }) => operatorname !== null && operatorname.trim() !== '')
      .map(({ operatorname, _count }) => ({
        operatorname: operatorname as string,
        count: _count.mobilephone1,
      }));

    // Encontrar a operadora com maior número de linhas
    const maxPhonesByOperator = phonesByOperator.reduce((max, current) => {
      return current.count > (max?.count || 0) ? current : max;
    }, null as { operatorname: string; count: number } | null);

    return NextResponse.json({
      phonesByOperator,
      maxPhonesByOperator,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de telefones por operadora:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
