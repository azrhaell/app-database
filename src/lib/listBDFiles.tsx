"use server";

import prisma from '@/app/api/database/dbclient';

export async function getBDFiles() {
  try {
    const files = await prisma.listfiles.findMany({
      where: {
        path: {
          contains: ".csv",
        },
        sincronized: false,
      },
      select: {
        name: true,
        path: true,
        qtdregisters: true,
        origin: true,
        created: true,
      },
    });

    console.log("Arquivos encontrados no BD:", files); // Debugging

    if (!files.length) {
      return { error: "Nenhum arquivo encontrado no banco de dados." };
    }

    const fileNames = files.map((file) => ({
      name: file.name,
      path: file.path,
      qtdregisters: file.qtdregisters,
      origin: file.origin,
      created: file.created,
    }));

    return { fileNames };

  } catch (error) {

    console.error("Erro ao buscar arquivos:", error);

    return ({ error: "Erro ao buscar arquivos." });

  } finally {

    await prisma.$disconnect();

  }
}