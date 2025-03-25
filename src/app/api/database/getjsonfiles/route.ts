export const revalidate = 0; // Evita cache
import { NextResponse } from 'next/server';

import prisma from '@/app/api/database/dbclient';

export async function GET() {
  try {
    const files = await prisma.listfiles.findMany({
      where: {
        path: {
          endsWith: ".json",
        },
        sincronized: false,
      },
      select: {
        name: true,
        qtdregisters: true,
        origin: true,
        created: true,
      },
    });

    const fileNames = files.map((file) => ({
      name: file.name,
      recordCount: file.qtdregisters ?? 0, // Garante um número válido
      origin: file.origin ?? "Desconhecido", // Garante uma string válida
      createdAt: file.created?.toISOString() ?? new Date().toISOString(), // Converte para string ISO válida
    }));

    return NextResponse.json({ fileNames }, { status: 200 }); // ✅ Agora retorna um NextResponse válido

  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return NextResponse.json({ error: 'Erro ao buscar arquivos.' }, { status: 500 }); // ✅ Retorna erro corretamente

  } finally {
    await prisma.$disconnect();
  }
}
