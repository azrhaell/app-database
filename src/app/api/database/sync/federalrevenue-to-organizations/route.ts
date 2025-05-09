// app/api/sync/federalrevenue-to-organizations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export const runtime = 'nodejs';

const BATCH_SIZE = 1000;

export async function POST() {
  try {
    const totalFederal = await prisma.federalrevenue.count();
    const totalBatches = Math.ceil(totalFederal / BATCH_SIZE);

    let totalCriados = 0;
    let totalAtualizados = 0;

    for (let i = 0; i < totalBatches; i++) {
      const batch = await prisma.federalrevenue.findMany({
        skip: i * BATCH_SIZE,
        take: BATCH_SIZE,
      });

      const cnpjs = batch.map(r => r.cnpj);
      const orgMap = new Map(
        (await prisma.organizations.findMany({
          where: { cnpj: { in: cnpjs } },
        })).map(o => [o.cnpj, o])
      );

      for (const record of batch) {
        const existing = orgMap.get(record.cnpj);

        const data = {
          ...record,
          idCompany: undefined,
          creatorId: record.creatorId,
        };

        if (existing) {
          await prisma.organizations.update({
            where: { cnpj: record.cnpj },
            data,
          });
          totalAtualizados++;
        } else {
          await prisma.organizations.create({ data });
          totalCriados++;
        }
      }
    }

    return NextResponse.json({
      message: `Sincronização concluída com sucesso. Criados: ${totalCriados}, Atualizados: ${totalAtualizados}.`,
      totalCriados,
      totalAtualizados,
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno ao sincronizar os dados.' },
      { status: 500 }
    );
  }
}
