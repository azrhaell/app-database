import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');

  if (!state) {
    return NextResponse.json({ error: 'Estado não fornecido' }, { status: 400 });
  }

  try {
    // Buscar todas as cidades distintas no estado
    const cities = await prisma.organizations.findMany({
      where: { state: state.trim() },
      select: { city: true },
      distinct: ['city'],
    });

    // Filtrar cidades inválidas
    const validCities = cities
      .map(({ city }) => city?.trim())
      .filter((city) => city && city !== '');

    if (validCities.length === 0) {
      return NextResponse.json([], { headers: { 'Content-Type': 'application/json' } });
    }

    // Consulta única usando aggregate
    const operatorCounts = await prisma.organizations.groupBy({
      by: ['city', 'operatorname'],
      where: { state: state.trim(), city: { in: validCities } },
      _count: { cnpj: true },
    });

    // Criar um mapa para armazenar o operador mais frequente por cidade
    const topOperatorsMap = new Map<string, string>();

    operatorCounts.forEach(({ city, operatorname, _count }) => {
      if (!city || !operatorname) return;
      const current = topOperatorsMap.get(city);
      if (!current || _count.cnpj > (topOperatorsMap.get(city) || 0)) {
        topOperatorsMap.set(city, operatorname);
      }
    });

    // Formatar resposta
    const citiesWithOperators = validCities.map((city) => ({
      city,
      operator: topOperatorsMap.get(city) || 'Nenhuma operadora encontrada',
    }));

    return NextResponse.json(citiesWithOperators, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao buscar cidades e operadoras:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
