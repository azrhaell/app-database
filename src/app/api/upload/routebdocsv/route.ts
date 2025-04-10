import { pipeline } from "stream/promises";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import readline from "readline";
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

    // 🔹 Contar linhas usando stream de leitura
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of rl) {
      lineCount++;
    }

    const qtdregisters = lineCount > 1 ? lineCount - 1 : 0;

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
