// app/api/stats/phones-by-state/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Etapa 1: Agrupar por idCompany e contar telefones
    const phonesGrouped = await prisma.numbers.groupBy({
      by: ['idCompany'],
      _count: {
        mobilephone1: true,
      },
      orderBy: {
        _count: {
          mobilephone1: 'desc',
        },
      },
      take: 1, // Apenas o com mais telefones
    });

    if (phonesGrouped.length === 0) {
      return NextResponse.json({ message: 'Nenhuma linha encontrada.' });
    }

    const topCompanyId = phonesGrouped[0].idCompany;
    const phoneCount = phonesGrouped[0]._count.mobilephone1;

    // Etapa 2: Buscar o CNPJ correspondente
    const company = await prisma.organizations.findUnique({
      where: { idCompany: topCompanyId },
      select: {
        cnpj: true,
      },
    });

    if (!company) {
      return NextResponse.json({ message: 'Empresa não encontrada.' });
    }

    return NextResponse.json({
      maxPhonesByCNPJ: {
        cnpj: company.cnpj,
        count: phoneCount,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar CNPJ com mais telefones:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CNPJ com mais telefones.' },
      { status: 500 }
    );
  }
}
