import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    // 🔹 Busca todos os arquivos da origem "BDO"
    const fileNames = await prisma.listfiles.findMany({
      where: { origin: "BDO", sincronized: false },
      select: {
        name: true,
        path: true,
        qtdregisters: true,
        origin: true,
        created: true,
      },
      orderBy: { created: "desc" }, // Ordena pelos mais recentes
    });

    return NextResponse.json({ fileNames });
  } catch (error) {
    console.error("❌ Erro ao buscar arquivos:", error);
    return NextResponse.json({ error: "Erro ao carregar arquivos." }, { status: 500 });
  }
}
