//Obter "naturezas jurídicas" da tabela legalnatures

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    // Buscar nomes da tabela legalnatures
    const fetchLegalNatures = await prisma.legalnatures.findMany({
      select: {
        name: true,
      },
    });

    // Retornar os nomes únicos
    const uniqueLegalNatures = fetchLegalNatures.map(ln => ln.name);

    return NextResponse.json(uniqueLegalNatures);
  } catch (error) {
    console.error('Erro ao buscar naturezas jurídicas:', error);
    return NextResponse.json({ error: 'Erro ao buscar naturezas jurídicas' }, { status: 500 });
  }
}