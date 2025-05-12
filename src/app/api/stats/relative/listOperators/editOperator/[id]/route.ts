import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    const data = await req.json();

    const updated = await prisma.operators.update({
      where: { idOperator: id },
      data: {
        name: data.name,
        description: data.description,
        codeoperador: data.codeoperador,
        codeantel: data.codeantel,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro no PUT /editOperator/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar registro' },
      { status: 500 }
    );
  }
}

