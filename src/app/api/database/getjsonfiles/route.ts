import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const files = await prisma.listfiles.findMany({
      where: {
        path: {
          endsWith: '.json',
        },
        sincronized: false,
      },
      select: {
        name: true,
        qtdregisters: true,
        origin: true,
        created: true,
      },
    });

    return NextResponse.json({ fileNames: files });
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return NextResponse.json({ error: 'Erro ao buscar arquivos.' }, { status: 500 });
  }
}
