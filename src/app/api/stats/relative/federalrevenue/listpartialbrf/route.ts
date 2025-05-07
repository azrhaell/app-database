// File: /app/api/stats/federalrevenue/random/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const total = await prisma.federalrevenue.count();

    const data = await prisma.federalrevenue.findMany({
      take: 100,
      orderBy: { idCompany: 'asc' },
    });

    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 100);

    return NextResponse.json({
      total,
      records: shuffled.map(org => ({
        cnpj: org.cnpj,
        companyname: org.companyname,
        legalnature: org.legalnature,
        companysize: org.companysize,
        optionalsize: org.optionalsize,
        optionmei: org.optionmei,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 });
  }
}
