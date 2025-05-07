import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function DELETE() {
  try {
    await prisma.bdo.deleteMany();
    return NextResponse.json({ message: 'Todos os registros da tabela BDO foram removidos com sucesso.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erro ao excluir os registros.' }, { status: 500 });
  }
}
