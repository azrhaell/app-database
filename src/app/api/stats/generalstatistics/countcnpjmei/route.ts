import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const meiCNPJs = await prisma.organizations.groupBy({
      by: ['cnpj'],
      where: { optionmei: true },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      meiCNPJs: meiCNPJs.length,
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
