import { NextResponse } from 'next/server';
import prisma from '../database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    //const uniqueCNPJs = await prisma.organizations.groupBy({ by: ['cnpj'] });
    //const uniquePhones = await prisma.organizations.groupBy({ by: ['mobilephone1'] });
    /*const cnpjsByStateRaw = await prisma.organizations.findMany({
      distinct: ['cnpj'],
      select: { state: true, cnpj: true },
    });*/
    /*const phonesByState = await prisma.organizations.groupBy({
      by: ['state'],
      _count: { mobilephone1: true },
    });*/
    const phonesByOperator = await prisma.organizations.groupBy({
      by: ['operatorname'],
      _count: { mobilephone1: true },
    });
    const phonesByCNPJ = await prisma.organizations.groupBy({
      by: ['cnpj'],
      _count: { mobilephone1: true },
    });
    const operatorsByStateRaw = await prisma.organizations.groupBy({
      by: ['state', 'operatorname'],
      where: { operatorname: { not: '' } },
    });
    const phonesByOperatorStateRaw = await prisma.organizations.groupBy({
      by: ['state', 'operatorname'],
      _count: { mobilephone1: true },
    });

    /* Contar CNPJs únicos por estado
    const cnpjsByState = Object.entries(
      cnpjsByStateRaw.reduce((acc, { state }) => {
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([state, count]) => ({ state, count }));*/

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

    // Agrupar operadores únicos por estado
    const operatorsByStateCount = operatorsByStateRaw.reduce((acc, { state }) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const operatorsByState = Object.entries(operatorsByStateCount).map(([state, count]) => ({
      state,
      count,
    }));

    // Encontrar a operadora com mais linhas no total
    const maxPhonesByOperator = phonesByOperator.reduce((max, item) => {
      return item._count.mobilephone1 > (max?._count.mobilephone1 || 0) ? item : max;
    }, null as { operatorname: string | null; _count: { mobilephone1: number } } | null);

    // Encontrar o CNPJ com mais linhas
    const maxPhonesByCNPJ = phonesByCNPJ.reduce((max, item) => {
      return item._count.mobilephone1 > (max?._count.mobilephone1 || 0) ? item : max;
    }, null as { cnpj: string; _count: { mobilephone1: number } } | null);

    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      //uniqueCNPJs: uniqueCNPJs.length,
      //uniquePhones: uniquePhones.length,
      //cnpjsByState,
      /*phonesByState: phonesByState.map(({ state, _count }) => ({
        state,
        count: _count.mobilephone1,
      })),*/
      phonesByOperator: phonesByOperator
        .filter(({ operatorname }) => operatorname !== null && operatorname !== '')
        .map(({ operatorname, _count }) => ({
          operatorname,
          count: _count.mobilephone1,
        })),
      operatorsByState,
      maxOperatorByState,
      maxPhonesByOperator: maxPhonesByOperator
        ? { operatorname: maxPhonesByOperator.operatorname, count: maxPhonesByOperator._count.mobilephone1 }
        : null,
      maxPhonesByCNPJ: maxPhonesByCNPJ
        ? { cnpj: maxPhonesByCNPJ.cnpj, count: maxPhonesByCNPJ._count.mobilephone1 }
        : null,
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
