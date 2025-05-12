import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Buscar os primeiros 2 dígitos do campo mobilephone1, remover nulos e duplicados
    const ddds = await prisma.organizations.findMany({
      select: {
        mobilephone1: true,
      },
      where: {
        mobilephone1: {
          not: null,
        },
      },
    });

    // Extrair os dois primeiros dígitos de cada número e filtrar únicos
    const uniqueDDDs = Array.from(
      new Set(
        ddds
          .map(({ mobilephone1 }) => mobilephone1?.substring(0, 2))
          .filter((ddd) => ddd) // Remover valores inválidos
      )
    ).sort();

    return NextResponse.json({ ddds: uniqueDDDs });
  } catch (error) {
    console.error('Erro ao buscar DDDs:', error);
    return NextResponse.json({ error: 'Erro ao buscar DDDs' }, { status: 500 });
  }
}
