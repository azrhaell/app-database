import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import readline from "readline";
import prisma from "../../database/dbclient";

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2000mb",
    },
    responseLimit: false,
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

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadBDODir = path.join(process.cwd(), "public/uploads/BDO");
    if (!fs.existsSync(uploadBDODir)) {
      fs.mkdirSync(uploadBDODir, { recursive: true });
    }

    const filePath = path.join(uploadBDODir, file.name);
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
    console.log(`📂 Arquivo salvo: ${filePath}`);

    // Contar número de registros no arquivo (excluindo cabeçalho)
    let qtdregisters = 0;
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream });

    let isFirstLine = true;
    for await (const line of rl) {
      if (isFirstLine) {
        isFirstLine = false; // Ignora o cabeçalho
        continue;
      }
      if (line.trim() !== "") qtdregisters++;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const verifiedFileName = `verified_${timestamp}_${file.name}`;

    await prisma.listfiles.create({ 
      data: {
        name: verifiedFileName,
        qtdregisters, 
        path: `/uploads/BDO/${file.name}`,
        extension: path.extname(file.name),
        origin: "BDO",
      },
    });

    return NextResponse.json({
      message: "Upload CSV concluído com sucesso!",
      caminhoArquivo: `/uploads/BDO/${file.name}`,
      qtdregisters,
    });
  } catch (error) {
    console.error("❌ Erro ao fazer upload do arquivo:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
