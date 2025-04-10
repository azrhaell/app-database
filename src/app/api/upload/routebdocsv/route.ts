import { pipeline } from "stream/promises";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
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

    const uploadDir = path.join(process.cwd(), "public/uploads/BDO");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    const stream = fs.createWriteStream(filePath);
    const reader = file.stream().getReader();

    console.log("🚀 Iniciando o upload...");
    const nodeStream = new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) return this.push(null);
        this.push(Buffer.from(value));
      },
    });

    await pipeline(nodeStream, stream);
    console.log(`✅ Upload concluído: ${filePath}`);

    // Contar registros (linhas) no arquivo CSV, exceto cabeçalho
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.trim().split("\n");
    const qtdregisters = lines.length > 1 ? lines.length - 1 : 0;

    // Registrar no banco de dados
    await prisma.listfiles.create({
      data: {
        name: file.name,
        qtdregisters,
        path: `/uploads/BDO/${file.name}`,
        extension: path.extname(file.name),
        origin: "BDO",
      },
    });

    return NextResponse.json({ message: "Upload concluído com sucesso!" });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
