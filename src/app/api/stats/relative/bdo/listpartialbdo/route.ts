import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // 1. Total de registros da tabela BDO (sem filtro)
    const total = await prisma.bdo.count();

    // 2. Operadoras válidas
    const validOperators = await prisma.operators.findMany({
      select: { codeoperador: true, name: true },
    });

    const validCodes = validOperators
      .map(op => op.codeoperador)
      .filter((code): code is string => code !== null); // ensure only strings

    // 3. Buscar registros filtrados por correspondência com operators
    const records = await prisma.bdo.findMany({
      where: {
        codeoperador: {
          in: validCodes,
        },
      },
      take: 1000,
      orderBy: { date: 'desc' },
    });

    // 4. Enriquecer com nome da operadora
    const enrichedRecords = records.map(record => {
      const operator = validOperators.find(op => op.codeoperador === record.codeoperador);
      return {
        ...record,
        name: operator?.name || 'Desconhecida',
      };
    });

    return NextResponse.json({ records: enrichedRecords, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro interno ao buscar os dados' },
      { status: 500 }
    );
  }
}