// app/api/database/sync/bdo-to-numbers/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export const runtime = 'nodejs';

const BATCH_SIZE = 1000;

export async function POST() {
  try {
    const totalBdo = await prisma.bdo.count();
    const totalBatches = Math.ceil(totalBdo / BATCH_SIZE);

    let totalAtualizados = 0;

    for (let i = 0; i < totalBatches; i++) {
      const batch = await prisma.bdo.findMany({
        skip: i * BATCH_SIZE,
        take: BATCH_SIZE,
        where: {
          number: { not: null },
          date: { not: null },
          codeoperador: { not: null },
        },
      });

      const numeros = batch.map(r => r.number!).filter(Boolean);

      const numbersMap = new Map(
        (
          await prisma.numbers.findMany({
            where: {
              mobilephone1: {
                in: numeros,
              },
              // Removido: startofcontract: { not: null }
            },
            select: {
              idNumber: true,
              mobilephone1: true,
              startofcontract: true,
              operatorname: true,
            },
          })
        ).map(n => [n.mobilephone1, n])
      );

      for (const bdo of batch) {
        const numberRecord = numbersMap.get(bdo.number!);

        if (
          numberRecord &&
          bdo.date &&
          (
            !numberRecord.startofcontract || // Atualiza se for nulo
            bdo.date > numberRecord.startofcontract
          )
        ) {
          await prisma.numbers.update({
            where: { idNumber: numberRecord.idNumber },
            data: {
              previousoperator: numberRecord.operatorname,
              operatorname: bdo.codeoperador!,
              startofcontract: bdo.date!,
              ported: true,
            },
          });
          totalAtualizados++;
        }
      }
    }

    return NextResponse.json({
      message: `Sincronização concluída com sucesso. Atualizados: ${totalAtualizados}.`,
      totalAtualizados,
    });
  } catch (error) {
    console.error('Erro na sincronização BDO -> Numbers:', error);
    return NextResponse.json(
      { error: 'Erro interno ao sincronizar os dados.' },
      { status: 500 }
    );
  }
}
