import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST() {
  try {
    // Primeira transação: atualiza operatorname
    await prisma.$transaction([
      prisma.numbers.updateMany({
        where: { operatorname: '12' },
        data: { operatorname: 'Algar' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: { in: ['15', '20', '23', 'Telefonica'] } },
        data: { operatorname: 'Vivo' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: { in: ['21', '36'] } },
        data: { operatorname: 'CLARO' },
      }),
      prisma.numbers.updateMany({
        where: { operatorname: { in: ['14', '31', '35'] } },
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

    // Segunda transação: atualiza previousoperator
    await prisma.$transaction([
      prisma.numbers.updateMany({
        where: { previousoperator: { in: ['12', 'ALGAR', 'algar'] } },
        data: { previousoperator: 'Algar' },
      }),
      prisma.numbers.updateMany({
        where: { previousoperator: { in: ['15', '20', '23', 'Telefonica', 'vivo', 'VIVO'] } },
        data: { previousoperator: 'Vivo' },
      }),
      prisma.numbers.updateMany({
        where: { previousoperator: { in: ['21', '36', 'Claro', 'claro'] } },
        data: { previousoperator: 'CLARO' },
      }),
      prisma.numbers.updateMany({
        where: { previousoperator: { in: ['14', '31', '35', 'Oi', 'oi'] } },
        data: { previousoperator: 'OI' },
      }),
      prisma.numbers.updateMany({
        where: { previousoperator: { in: ['41', 'TIM', 'tim'] } },
        data: { previousoperator: 'Tim' },
      }),
      prisma.numbers.updateMany({
        where: { previousoperator: '43' },
        data: { previousoperator: 'Sercomtel' },
      }),
    ]);

    await prisma.$disconnect();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao corrigir dados:', error);
    await prisma.$disconnect();
    return NextResponse.json({ error: 'Erro ao corrigir operatorname ou previousoperator' }, { status: 500 });
  }
}
