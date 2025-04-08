import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const validUFs = [
      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
      "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
      "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ];

    const fetchListStates = await prisma.states.findMany({
      select: {
        name: true,
      },
    });

    const uniqueStates = fetchListStates
      .map(item => item.name?.trim().toUpperCase()) // tira espaços e padroniza maiúsculas
      .filter(uf =>
        uf &&                      // remove nulos/undefined
        isNaN(Number(uf)) &&       // remove valores puramente numéricos
        validUFs.includes(uf)      // mantém apenas siglas válidas
      );

    return NextResponse.json(uniqueStates);
  } catch (error) {
    console.error('Erro ao buscar UFs:', error);
    return NextResponse.json({ error: 'Erro ao buscar UFs' }, { status: 500 });
  }
}
