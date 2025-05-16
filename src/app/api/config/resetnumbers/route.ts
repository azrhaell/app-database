// src/app/api/config/resetnumbers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST() {
  try {
    await prisma.numbers.updateMany({
      data: {
        ported: false,
        startofcontract: null,
        previousoperator: '',
      },
    });

    return NextResponse.json({ message: 'Campos redefinidos com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir os dados:', error);
    return NextResponse.json({ error: 'Erro interno ao redefinir dados.' }, { status: 500 });
  }
}
