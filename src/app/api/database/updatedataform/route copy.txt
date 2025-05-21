
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST() {
  try {
    // Buscar nomes únicos da tabela organizations
    const fetchOrganizationData = await prisma.organizations.findMany({
      select: {
        legalnature: true,
        operatorname: true,
        state: true,
        companysize: true,
        mobilephone1: true,
      },
      distinct: ['legalnature', 'operatorname', 'state', 'companysize'],
    });

    const uniqueLegalNatures = Array.from(new Set(fetchOrganizationData.map(org => org.legalnature))).filter(name => name !== null);
    const uniqueOperators = Array.from(new Set(fetchOrganizationData.map(org => org.operatorname))).filter(name => name !== null);
    const uniqueState = Array.from(new Set(fetchOrganizationData.map(org => org.state))).filter(name => name !== null);
    const uniqueCompanySize = Array.from(new Set(fetchOrganizationData.map(org => org.companysize))).filter(name => name !== null);
    const uniquePhonePrefixes = Array.from(new Set(fetchOrganizationData.map(org => org.mobilephone1?.substring(0, 2)))).filter(prefix => prefix !== null);

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
      await prisma.operators.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Atualizar a tabela states
    for (const name of uniqueState) {
      await prisma.states.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Atualizar a tabela companysizes
    for (const name of uniqueCompanySize) {
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

    return NextResponse.json({ message: 'Tabelas atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar tabelas:', error);
    return NextResponse.json({ error: 'Erro ao atualizar tabelas' }, { status: 500 });
  }
}