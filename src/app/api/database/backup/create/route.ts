import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function POST() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "public", "backups");
    const fileName = `backup-db-${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não definida." }, { status: 500 });
    }

    const dumpCommand = `pg_dump --no-owner --no-acl --dbname=${dbUrl} > "${filePath}"`;

    await new Promise((resolve, reject) => {
      exec(dumpCommand, (error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });

    return NextResponse.json({ message: "Backup criado com sucesso.", file: `/backups/${fileName}` });
  } catch (error) {
    console.error("Erro ao gerar backup:", error);
    return NextResponse.json({ error: "Erro ao gerar backup do banco de dados." }, { status: 500 });
  }
}
