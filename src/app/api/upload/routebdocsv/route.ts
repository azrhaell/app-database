import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "../../database/dbclient";

export const runtime = "nodejs";

// This is a Node.js runtime for the API route
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "4gb", // Aumenta o limite da resposta
    externalResolver: true,
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/BDO");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log("📁 Diretório de upload:", uploadDir);
    const filePath = path.join(uploadDir, file.name);
    console.log("📂 Caminho do arquivo:", filePath);
    console.log("Iniciando leitura do arquivo...");
    const writeStream = fs.createWriteStream(filePath);
    console.log("📥 Criando stream de escrita...");
    const reader = file.stream().getReader();
    console.log("📥 Criando stream de leitura...");

    //console.log("📥 Iniciando upload...");

    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalSize += value.length;
        writeStream.write(Buffer.from(value));
      }
    }
    console.log("📥 Upload concluído!");

    writeStream.end();
    console.log(`📂 Arquivo salvo: ${filePath}`);
    console.log(`📦 Tamanho final: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

    await prisma.listfiles.create({ 
      data: {
        name: file.name,
        path: `/uploads/BDO/${file.name}`,
        extension: path.extname(file.name),
        origin: "BDO",
      },
    });

    return NextResponse.json({
      message: "Upload CSV concluído com sucesso!",
      caminhoArquivo: `/uploads/BDO/${file.name}`,
    });
  } catch (error) {
    console.error("❌ Erro ao fazer upload do arquivo:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
