import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "../../database/dbclient";

export const runtime = "nodejs";

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

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadBRFDir = path.join(process.cwd(), "public/uploads/BRF");
    if (!fs.existsSync(uploadBRFDir)) {
      fs.mkdirSync(uploadBRFDir, { recursive: true });
    }
    
    const filePath = path.join(uploadBRFDir, file.name);
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
    console.log(`📂 Arquivo salvo: ${filePath}`);

    // Contar número de registros no arquivo (excluindo cabeçalho)
    const fileContent = fs.readFileSync(filePath, "utf8");
    const lines = fileContent.split("\n").filter(line => line.trim() !== "");
    const qtdregisters = lines.length > 1 ? lines.length - 1 : 0;

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const verifiedFileName = `verified_${timestamp}_${file.name}`;

    await prisma.listfiles.create({ 
      data: {
        name: verifiedFileName,
        qtdregisters, 
        path: `/uploads/BRF/${file.name}`,
        extension: path.extname(file.name),
        origin: "BRF",
      },
    });

    return NextResponse.json({
      message: "Upload CSV concluído com sucesso!",
      caminhoArquivo: `/uploads/BRF/${file.name}`,
      qtdregisters,
    });
  } catch (error) {
    console.error("❌ Erro ao fazer upload do arquivo:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
