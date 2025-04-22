import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const microEmpresaCNPJs = await prisma.organizations.groupBy({
      by: ['cnpj'],
      where: { companysize: 'MICRO EMPRESA' },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      microEmpresaCNPJs: microEmpresaCNPJs.length,
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
