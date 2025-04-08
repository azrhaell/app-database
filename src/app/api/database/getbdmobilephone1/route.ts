//Obter "operatorname" da tabela operators

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient'

export async function GET() {
  try {
    const fetchListDDDs = await prisma.codeddd.findMany({
      select: {
        ddd: true,
      },
    });

    // Remove qualquer caractere que não seja número
    const uniqueDDDs = fetchListDDDs.map((ln) => ln.ddd.replace(/\D/g, ""));

    return NextResponse.json(uniqueDDDs);
  } catch (error) {
    console.error('Erro ao buscar DDDs:', error);
    return NextResponse.json({ error: 'Erro ao buscar DDDs' }, { status: 500 });
  }
}
