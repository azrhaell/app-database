import { NextResponse } from "next/server";
import prisma from "../database/dbclient";

export async function DELETE() {
  try {
    console.log("Iniciando remoção de registros...");

    // Removendo em lotes para evitar bloqueios
    let totalDeleted = 0;
    const batchSize = 25; // Ajuste conforme necessário

    while (true) {
      const organizationsToDelete = await prisma.organizations.findMany({
        take: batchSize,
      });

      if (organizationsToDelete.length === 0) {
        break;
      }

      const { count } = await prisma.organizations.deleteMany({
        where: {
          number: {
            in: organizationsToDelete.map((org) => org.number).filter((num): num is string => num !== null),
          },
        },
      });

      totalDeleted += count;
      console.log(`Registros deletados: ${totalDeleted}`);

      if (count < batchSize) break; // Sai do loop quando não houver mais registros
    }

    console.log("Remoção concluída.");
    return NextResponse.json({ message: "Registros removidos com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover registros:", error);
    return NextResponse.json(
      { message: "Erro ao remover registros" },
      { status: 500 }
    );
  }
}
