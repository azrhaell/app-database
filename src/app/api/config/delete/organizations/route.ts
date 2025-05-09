import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export const runtime = 'nodejs'; // obrigatório no Next.js 15.1.6 com Edge desativado

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

    // Verifica se a tabela numbers está vazia
    const totalNumbers = await prisma.numbers.count();

    if (totalNumbers > 0) {
      return NextResponse.json(
        { error: `A exclusão foi bloqueada: existem ${totalNumbers} registros na tabela 'numbers'.` },
        { status: 400 }
      );
    }

    const deleted = await prisma.organizations.deleteMany({});

    return NextResponse.json({
      message: `Todos os registros da tabela 'organizations' foram apagados.`,
      totalApagados: deleted.count,
    });
  } catch (error) {
    console.error('Erro ao apagar registros da tabela organizations:', error);
    return NextResponse.json(
      { error: 'Erro interno ao tentar apagar os registros.' },
      { status: 500 }
    );
  }
}
