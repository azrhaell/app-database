export const revalidate = 0; // Evita cache

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

    return { fileNames };
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return { error: "Erro ao buscar arquivos." };
  } finally {
    await prisma.$disconnect();
  }
}
