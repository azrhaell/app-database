// app/api/stats/phones-by-state/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Agrupa por estado via relação com organizations
    const phonesByState = await prisma.numbers.groupBy({
      by: ['idCompany'],
      _count: {
        mobilephone1: true,
      },
    });

    if (phonesByState.length === 0) {
      return NextResponse.json({ message: 'Nenhuma linha encontrada.' });
    }

    // Busca os estados correspondentes aos idCompanys
    const companies = await prisma.organizations.findMany({
      where: {
        idCompany: {
          in: phonesByState.map(item => item.idCompany),
        },
      },
      select: {
        idCompany: true,
        state: true,
      },
    });

    // Mapeia idCompany => state
    const companyStateMap = new Map(companies.map(c => [c.idCompany, c.state || 'N/A']));

    // Agrega o total de linhas por estado
    const statePhoneCounts: Record<string, number> = {};

    for (const group of phonesByState) {
      const state = companyStateMap.get(group.idCompany) || 'N/A';
      statePhoneCounts[state] = (statePhoneCounts[state] || 0) + group._count.mobilephone1;
    }

    return NextResponse.json(statePhoneCounts);
  } catch (error) {
    console.error('Erro ao buscar estatísticas por estado:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas de Telefones por estado.' }, { status: 500 });
  }
}
