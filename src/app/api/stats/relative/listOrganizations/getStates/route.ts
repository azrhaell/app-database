import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const states = await prisma.organizations.findMany({
      select: { state: true },
      distinct: ['state'],
    });

    const stateList = states.map((s) => s.state).filter(Boolean); // Filtra valores nulos ou indefinidos

    return NextResponse.json({ states: stateList });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro ao buscar UFs' }, { status: 500 });
  }
}
