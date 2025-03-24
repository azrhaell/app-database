import prisma from '@/app/api/database/dbclient';

export async function getJsonFiles() {
  try {
    const files = await prisma.listfiles.findMany({
      where: {
        path: {
          contains: ".json",
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
      recordCount: file.qtdregisters,
      origin: file.origin,
      createdAt: file.created,
    }));

    return { fileNames };
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return ({ error: "Erro ao buscar arquivos." });
  } finally {
    await prisma.$disconnect();
  }
}