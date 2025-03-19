//RESPONSÁVEL POR REALIZAR O UPLOAD DO ARQUIVO CSV BASE DE DADOS MAILING ANATEL

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

    const verifiedBDMAILINGDir = path.join(process.cwd(), "public/uploads/verifiedBDMAILING");
    if (!fs.existsSync(verifiedBDMAILINGDir)) {
      fs.mkdirSync(verifiedBDMAILINGDir, { recursive: true });
    }

    const originalFilePath = path.join(uploadDir, file.name);
    fs.writeFileSync(originalFilePath, Buffer.from(await file.arrayBuffer()));
    
    console.log(`📂 Arquivo original salvo: ${originalFilePath}`);

    const now = new Date();
    const verifiedFileName = `verified_${now.toISOString().replace(/[:.]/g, "-")}_${file.name}`;
    const verifiedFilePath = path.join(verifiedBDMAILINGDir, verifiedFileName);
    const writeStream = fs.createWriteStream(verifiedFilePath);

    const fileExtension = path.extname(file.name);
    const origin = "MAILING";

    const firstLine = fs.readFileSync(originalFilePath, "utf8").split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";

    console.log(`🔍 Delimitador detectado: '${delimiter}'`);

    writeStream.write(`CNPJ${delimiter}DSNOMERAZAO${delimiter}UF${delimiter}DDD${delimiter}TELEFONE${delimiter}NOMEOPERADORA${delimiter}DTINSTALACAO\n`);

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
      const DSNOMERAZAO = record["DSNOMERAZAO"]?.trim() || "";
      const UF = record["UF"]?.trim() || "";
      const DDD = record["DDD"]?.trim() || "";
      const TELEFONE = record["TELEFONE"]?.trim() || "";
      const NOMEOPERADORA = record["NOMEOPERADORA"]?.trim().toUpperCase() || "";
      const DTINSTALACAO = record["DTINSTALACAO"]?.trim() || "";

      if (!CNPJ || !DSNOMERAZAO || !UF || !DDD || !TELEFONE || !NOMEOPERADORA || !DTINSTALACAO) {
        console.log("⚠️ Ignorando linha por falta de campos essenciais:", record);
        continue;
      }
      
      writeStream.write(`${CNPJ}${delimiter}${DSNOMERAZAO}${delimiter}${UF}${delimiter}${DDD}${delimiter}${TELEFONE}${delimiter}${NOMEOPERADORA}${delimiter}${DTINSTALACAO}\n`);
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
        path: `/uploads/verifiedBDMAILING/${verifiedFileName}`,
        extension: fileExtension,
        origin: origin,
      },
    });

    return NextResponse.json({
      message: "CSV verificado com sucesso!",
      linhasVerificadas: verifiedCount,
      caminhoArquivo: `/uploads/verifiedBDMAILING/${verifiedFileName}`,
    });
  } catch (error) {
    console.error("❌ Erro ao processar o CSV:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
