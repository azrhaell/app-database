import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const fetchListDDDs = await prisma.codeddd.findMany({
      select: {
        ddd: true,
      },
    });

    const uniqueDDDs = fetchListDDDs
      .map((ln) => ln.ddd?.replace(/\D/g, "")) // remove não numéricos
      .filter((ddd) => ddd && ddd.trim().length > 0); // remove nulos/vazios

    return NextResponse.json(uniqueDDDs);
  } catch (error) {
    console.error('Erro ao buscar DDDs:', error);
    return NextResponse.json({ error: 'Erro ao buscar DDDs' }, { status: 500 });
  }
}
