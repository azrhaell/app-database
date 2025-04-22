import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const pequenoPorteCNPJs = await prisma.organizations.groupBy({
      by: ['cnpj'],
      where: { companysize: 'EMPRESA DE PEQUENO PORTE' },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      pequenoPorteCNPJs: pequenoPorteCNPJs.length,
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
