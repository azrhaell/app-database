import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/app/api/database/dbclient";

// Função recursiva para listar todos os arquivos
function listAllFiles(dir: string, baseDir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listAllFiles(filePath, baseDir));
    } else {
      results.push(path.relative(baseDir, filePath).replace(/\\/g, "/"));
    }
  });
  return results;
}

export async function GET() {
  try {
    const uploadsPath = path.join(process.cwd(), "public/uploads");
    const allFiles = listAllFiles(uploadsPath, path.join(process.cwd(), "public"));

    const dbFiles = await prisma.listfiles.findMany({
      where: {
        path: { in: allFiles },
      },
      select: {
        idFile: true,
        name: true,
        path: true,
        sincronized: true,
      },
    });

    return NextResponse.json(dbFiles);
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json({ error: "Erro ao listar arquivos." }, { status: 500 });
  }
}
