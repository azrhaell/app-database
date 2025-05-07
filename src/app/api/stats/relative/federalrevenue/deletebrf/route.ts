// File: /app/api/stats/federalrevenue/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function DELETE() {
  try {
    const deleted = await prisma.federalrevenue.deleteMany();
    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error('Erro ao excluir registros:', error);
    return NextResponse.json({ error: 'Erro ao excluir registros.' }, { status: 500 });
  }
}
