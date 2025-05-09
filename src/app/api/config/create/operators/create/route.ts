import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, codeoperador, codeantel } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
    }

    const novoOperador = await prisma.operators.create({
      data: {
        name,
        description: description || null,
        codeoperador: codeoperador || null,
        codeantel: codeantel || null,
        disabled: false,
      },
    });

    return NextResponse.json({ message: 'Operadora criada com sucesso.', operador: novoOperador });
  } catch (error) {
    console.error('Erro ao criar operadora:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
