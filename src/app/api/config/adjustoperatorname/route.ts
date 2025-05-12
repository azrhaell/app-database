import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST() {
  try {
    // Atualizar os valores conforme as especificações
    await prisma.$transaction([
      prisma.numbers.updateMany({
        where: { operatorname: '12' },
        data: { operatorname: 'Algar' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: { in: ['15', 'Telefonica'] } },
        data: { operatorname: 'Vivo' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: { in: ['20', '21', '36'] } },
        data: { operatorname: 'CLARO' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: '31' },
        data: { operatorname: 'OI' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: '41' },
        data: { operatorname: 'Tim' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: '43' },
        data: { operatorname: 'Sercomtel' },
      }),
    ]);

    await prisma.$disconnect();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao corrigir operatorname:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Erro ao corrigir operatorname' }, { status: 500 });
  }
}
