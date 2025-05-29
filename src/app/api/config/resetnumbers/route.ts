// src/app/api/config/resetnumbers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

const TOKEN = 'TCTelecom2025TC';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== TOKEN) {
    return NextResponse.json(
      { error: 'Token de confirmação ausente ou inválido. A operação foi bloqueada.' },
      { status: 403 }
    );
  }

  try {
    await prisma.numbers.updateMany({
      data: {
        ported: false,
        
        startofcontract: null,
        previousoperator: '',
      },
    });

    return NextResponse.json(
      { message: 'Campos redefinidos com sucesso.' }
    );
  } catch (error) {
    console.error('Erro ao redefinir os dados:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir dados.' },
      { status: 500 }
    );
  }
}
