import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    // Executando as queries separadamente para evitar estouro do pool de conexões
    const phonesByCNPJ = await prisma.organizations.groupBy({
      by: ['cnpj'],
      _count: { mobilephone1: true },
    });

    // Encontrar o CNPJ com mais linhas
    const maxPhonesByCNPJ = phonesByCNPJ.reduce((max, item) => {
      return item._count.mobilephone1 > (max?._count.mobilephone1 || 0) ? item : max;
    }, null as { cnpj: string; _count: { mobilephone1: number } } | null);


    await prisma.$disconnect(); // Fecha a conexão após executar as consultas

    return NextResponse.json({
      
      maxPhonesByCNPJ: maxPhonesByCNPJ
        ? { cnpj: maxPhonesByCNPJ.cnpj, count: maxPhonesByCNPJ._count.mobilephone1 }
        : null,
        });

  } catch (error) {
    console.error(error);
    await prisma.$disconnect(); // Garante que a conexão será fechada em caso de erro
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}