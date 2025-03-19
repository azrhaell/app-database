//Obter "operatorname" da tabela operators

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    // Buscar nomes da tabela states
    const fetchListStates = await prisma.states.findMany({
      select: {
        name: true,
      },
    });

    // Retornar os nomes únicos
    const uniqueStates = fetchListStates.map(ln => ln.name);

    return NextResponse.json(uniqueStates);
  } catch (error) {
    console.error('Erro ao buscar UFs:', error);
    return NextResponse.json({ error: 'Erro ao buscar UFs' }, { status: 500 });
  }
}