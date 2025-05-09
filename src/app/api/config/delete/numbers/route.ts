import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export const runtime = 'nodejs'; // explícito para Next.js 15.1.6

const AUTHORIZED_TOKEN = 'TCTelecom2025TC@';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (token !== AUTHORIZED_TOKEN) {
      return NextResponse.json(
        { error: 'Token de confirmação ausente ou inválido. A operação foi bloqueada.' },
        { status: 403 }
      );
    }

    const deleted = await prisma.numbers.deleteMany({});

    return NextResponse.json({
      message: `Todos os registros da tabela 'numbers' foram apagados.`,
      totalApagados: deleted.count,
    });
  } catch (error) {
    console.error('Erro ao apagar registros da tabela numbers:', error);
    return NextResponse.json(
      { error: 'Erro interno ao tentar apagar os registros.' },
      { status: 500 }
    );
  }
}
