import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST() {
  try {
    // Buscar dados únicos da tabela organizations
    const fetchOrganizationData = await prisma.organizations.findMany({
      select: {
        legalnature: true,
        state: true,
        companysize: true,
        ddd1: true,
      },
    });

    // Buscar nomes de operadores da tabela de números (pois está relacionada à organization)
    const fetchOperatorData = await prisma.numbers.findMany({
      select: {
        operatorname: true,
      },
    });

    const uniqueLegalNatures = Array.from(
      new Set(fetchOrganizationData.map(org => org.legalnature).filter((name): name is string => !!name))
    );

    const uniqueOperators = Array.from(
      new Set(fetchOperatorData.map(n => n.operatorname).filter((name): name is string => !!name))
    );

    const uniqueStates = Array.from(
      new Set(fetchOrganizationData.map(org => org.state).filter((name): name is string => !!name))
    );

    const uniqueCompanySizes = Array.from(
      new Set(fetchOrganizationData.map(org => org.companysize).filter((name): name is string => !!name))
    );

    const uniquePhonePrefixes = Array.from(
      new Set(fetchOrganizationData.map(org => org.ddd1).filter((ddd): ddd is string => !!ddd))
    );

    // Atualizar a tabela legalnatures
    for (const name of uniqueLegalNatures) {
      await prisma.legalnatures.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Atualizar a tabela operators
    for (const name of uniqueOperators) {
      const existing = await prisma.operators.findFirst({
        where: { name },
      });

      if (!existing) {
        await prisma.operators.create({ data: { name } });
      }
    }

    // Atualizar a tabela states
    for (const name of uniqueStates) {
      await prisma.states.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Atualizar a tabela companysizes
    for (const name of uniqueCompanySizes) {
      await prisma.companysizes.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Atualizar a tabela codeddd
    for (const ddd of uniquePhonePrefixes) {
      await prisma.codeddd.upsert({
        where: { ddd },
        update: {},
        create: { ddd },
      });
    }

    return NextResponse.json({
      legalnatures: uniqueLegalNatures,
      operators: uniqueOperators,
      states: uniqueStates,
      companysizes: uniqueCompanySizes,
      codeddd: uniquePhonePrefixes,
    });

  } catch (error) {
    console.error('Erro ao atualizar tabelas:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tabelas' },
      { status: 500 }
    );
  }
}
