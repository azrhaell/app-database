//RESPONSÁVEL POR REALIZAR O UPLOAD DO ARQUIVO CSV BASE DE DADOS DE OPERADORAS

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import parse from "csv-parser";
import prisma from "../../database/dbclient";

export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: false,
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

    const filteredBDODir = path.join(process.cwd(), "public/uploads/filteredBDO");
    if (!fs.existsSync(filteredBDODir)) {
      fs.mkdirSync(filteredBDODir, { recursive: true });
    }

    const originalFilePath = path.join(uploadDir, file.name);
    fs.writeFileSync(originalFilePath, Buffer.from(await file.arrayBuffer()));
    console.log(`📂 Arquivo original salvo: ${originalFilePath}`);

    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, "-");
    const filteredFileName = `filtered_${formattedDate}_${file.name}`;
    const filteredFilePath = path.join(filteredBDODir, filteredFileName);
    const writeStream = fs.createWriteStream(filteredFilePath);

    writeStream.write("number,operadora,datahora\n");

    const dddsPermitidos = ["21", "22", "24", "27", "28"];
    const parser = fs.createReadStream(originalFilePath).pipe(parse({ columns: true } as parse.Options));

    let filteredCount = 0;
    for await (const record of parser) {
      const { number, operadora, datahora } = record;
      if (!number || !operadora || !datahora) continue;

      const ddd = number.slice(0, 2);
      if (dddsPermitidos.includes(ddd)) {
        writeStream.write(`${number},${operadora},${datahora}\n`);
        filteredCount++;
      }
    }

    writeStream.end();
    console.log(`✅ Processamento concluído! Linhas filtradas: ${filteredCount}`);
    console.log(`📂 Arquivo filtrado salvo em: ${filteredFilePath}`);

    // 🔹 Salvar no banco de dados
    const savedFile = await prisma.listfiles.create({
      data: {
        name: filteredFileName,
        qtdregisters: filteredCount,
        path: `/uploads/filteredBDO/${filteredFileName}`,
        extension: path.extname(filteredFileName),
        origin: "BDO",
      },
    });

    return NextResponse.json({ 
      message: "CSV filtrado com sucesso!", 
      linhasFiltradas: filteredCount,
      caminhoArquivo: savedFile.path,
    });
  } catch (error) {
    console.error("❌ Erro ao processar o CSV:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
