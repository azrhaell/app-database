import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const records = await prisma.bdo.findMany({
      take: 100,
      orderBy: { date: 'desc' },
    });

    const operators = await prisma.operators.findMany({
      select: {
        codeoperador: true,
        name: true,
      },
    });

    // Relaciona manualmente bdo.codeoperador com operators.codeoperador
    const enrichedRecords = records.map((record) => {
      const operator = operators.find(
        (op) => op.codeoperador === record.codeoperador
      );
      return {
        ...record,
        operadora: operator?.name || 'Desconhecida',
      };
    });

    const total = await prisma.bdo.count();

    return NextResponse.json({ records: enrichedRecords, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro interno ao buscar os dados' },
      { status: 500 }
    );
  }
}
