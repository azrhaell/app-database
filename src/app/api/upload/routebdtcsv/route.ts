//RESPONSÁVEL POR REALIZAR O UPLOAD DO ARQUIVO CSV BASE DE DADOS DE TERCEIROS

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

    const verifiedBDTDir = path.join(process.cwd(), "public/uploads/verifiedBDT");
    if (!fs.existsSync(verifiedBDTDir)) {
      fs.mkdirSync(verifiedBDTDir, { recursive: true });
    }

    const originalFilePath = path.join(uploadDir, file.name);
    fs.writeFileSync(originalFilePath, Buffer.from(await file.arrayBuffer()));
    
    console.log(`📂 Arquivo original salvo: ${originalFilePath}`);

    const now = new Date();
    const verifiedFileName = `verified_${now.toISOString().replace(/[:.]/g, "-")}_${file.name}`;
    const verifiedFilePath = path.join(verifiedBDTDir, verifiedFileName);
    const writeStream = fs.createWriteStream(verifiedFilePath);

    const fileExtension = path.extname(file.name);
    const origin = "BDT";

    const firstLine = fs.readFileSync(originalFilePath, "utf8").split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";

    console.log(`🔍 Delimitador detectado: '${delimiter}'`);

    writeStream.write(`CNPJ${delimiter}RAZAO_SOCIAL${delimiter}UF${delimiter}N_LINHAS${delimiter}OPERADORA${delimiter}FIDELIDADE${delimiter}\n`);

    const headerMapping: { [key: string]: string } = {};
    const parser = fs.createReadStream(originalFilePath).pipe(
      parse({
        separator: delimiter,
        mapHeaders: ({ header }) => {
          const normalizedHeader = header.trim().toUpperCase();
          headerMapping[normalizedHeader] = header;
          return normalizedHeader;
        },
      })
    );

    let verifiedCount = 0;
    for await (const record of parser) {
      const CNPJ = record["CNPJ"]?.trim() || "";
      const RAZAO_SOCIAL = record["RAZAO_SOCIAL"]?.trim() || "";
      const UF = record["UF"]?.trim() || "";
      const N_LINHAS = record["N_LINHAS"]?.trim() || "";
      const OPERADORA = record["OPERADORA"]?.trim().toUpperCase() || "";
      const FIDELIDADE = record["FIDELIDADE"]?.trim() || "";

      if (!CNPJ || !RAZAO_SOCIAL || !UF || !N_LINHAS || !OPERADORA || !FIDELIDADE) {
        console.log("⚠️ Ignorando linha por falta de campos essenciais:", record);
        continue;
      }
      
      writeStream.write(`${CNPJ}${delimiter}${RAZAO_SOCIAL}${delimiter}${UF}${delimiter}${N_LINHAS}${delimiter}${OPERADORA}${delimiter}${FIDELIDADE}\n`);
      verifiedCount++;
    }

    writeStream.end();
    console.log(`✅ Processamento concluído! Linhas verificadas: ${verifiedCount}`);
    console.log(`📂 Arquivo verificado salvo em: ${verifiedFilePath}`);

    // Salvar os detalhes do arquivo na tabela listfiles
    await prisma.listfiles.create({
      data: {
        name: verifiedFileName,
        qtdregisters: verifiedCount,
        path: `/uploads/verifiedBDT/${verifiedFileName}`,
        extension: fileExtension,
        origin: origin,
      },
    });

    return NextResponse.json({
      message: "CSV verificado com sucesso!",
      linhasVerificadas: verifiedCount,
      caminhoArquivo: `/uploads/verifiedBDT/${verifiedFileName}`,
    });
  } catch (error) {
    console.error("❌ Erro ao processar o CSV:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
