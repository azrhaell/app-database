import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export const runtime = "nodejs";

export async function POST() {
  try {
    const backupDir = path.join(process.cwd(), "public", "backups");
    const archiveDir = path.join(process.cwd(), "public", "backup-archives");

    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ error: "Nenhum backup encontrado." }, { status: 404 });
    }

    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archivePath = path.join(archiveDir, `archive-backups-${timestamp}.zip`);

    const zipCommand = `zip -j "${archivePath}" ${backupDir}/*.sql`;

    await new Promise((resolve, reject) => {
      exec(zipCommand, (error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });

    return NextResponse.json({ message: "Arquivos de backup compactados com sucesso.", file: `/backup-archives/archive-backups-${timestamp}.zip` });
  } catch (error) {
    console.error("Erro ao arquivar backups:", error);
    return NextResponse.json({ error: "Erro ao arquivar backups." }, { status: 500 });
  }
}
