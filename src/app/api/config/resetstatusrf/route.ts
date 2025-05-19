// app/api/config/resetrfstatus/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== 'TCTelecom2025TC') {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 403 });
  }

  try {
    const result = await prisma.organizations.updateMany({
      data: {
        rfstatus: '',
      },
    });

    return NextResponse.json({
      message: 'Status RF redefinido com sucesso.',
      totalAtualizados: result.count,
    });
  } catch (error) {
    console.error('Erro ao redefinir status RF:', error);
    return NextResponse.json({ error: 'Erro interno ao redefinir status RF.' }, { status: 500 });
  }
}
