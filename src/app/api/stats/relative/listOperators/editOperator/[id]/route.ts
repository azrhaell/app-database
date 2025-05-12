import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  return NextResponse.json({ message: 'Método não suportado' }, { status: 405 });
}

export default async function handler(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;

  if (req.method === 'PUT') {
    try {
      const id = Number(params.id);
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

  return NextResponse.json(
    { error: 'Método não suportado' },
    { status: 405 }
  );
}
