import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const operatorsWithCount = await prisma.organizations.groupBy({
      by: ['operatorname'],
      _count: {
        mobilephone1: true,
      },
      where: {
        operatorname: {
          not: '',
        },
      },
    });

    return NextResponse.json(
      operatorsWithCount.map(({ operatorname, _count }) => ({
        operatorname,
        count: _count.mobilephone1,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar operadoras' }, { status: 500 });
  }
}
