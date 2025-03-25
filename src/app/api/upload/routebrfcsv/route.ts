//RESPONSÁVEL POR REALIZAR O UPLOAD DO ARQUIVO CSV BASE DE DADOS DA RECEITA FEDERAL

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import parse from "csv-parser";
import prisma from "../../database/dbclient";

export const runtime = "nodejs";
//export const config = {   api: {     bodyParser: false } };
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2000mb', // Ajuste para o tamanho máximo necessário
    },
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

    const verifiedBRFDir = path.join(process.cwd(), "public/uploads/verifiedBRF");
    if (!fs.existsSync(verifiedBRFDir)) {
      fs.mkdirSync(verifiedBRFDir, { recursive: true });
    }

    const originalFilePath = path.join(uploadDir, file.name);
    fs.writeFileSync(originalFilePath, Buffer.from(await file.arrayBuffer()));
    console.log(`📂 Arquivo original salvo: ${originalFilePath}`);

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const verifiedFileName = `verified_${timestamp}_${file.name}`;
    const verifiedFilePath = path.join(verifiedBRFDir, verifiedFileName);
    const writeStream = fs.createWriteStream(verifiedFilePath);

    const firstLine = fs.readFileSync(originalFilePath, "utf8").split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";
    console.log(`🔍 Delimitador detectado: '${delimiter}'`);

    writeStream.write(`CNPJ${delimiter}RAZAO_SOCIAL${delimiter}SITUACAO_CADASTRAL${delimiter}NATUREZA_JURIDICA${delimiter}PORTE_EMPRESA${delimiter}OPCAO_SIMPLES${delimiter}OPCAO_MEI${delimiter}UF${delimiter}DDD1\n`);

    const headerMapping: Record<string, string> = {};
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
      const SITUACAO_CADASTRAL = record["SITUACAO_CADASTRAL"]?.trim().toUpperCase() || "";
      const NATUREZA_JURIDICA = record["NATUREZA_JURIDICA"]?.trim().toUpperCase() || "";
      const PORTE_EMPRESA = record["PORTE_EMPRESA"]?.trim().toUpperCase() || "";
      const OPCAO_SIMPLES = record["OPCAO_SIMPLES"]?.trim().toUpperCase() || "";
      const OPCAO_MEI = record["OPCAO_MEI"]?.trim().toUpperCase() || "";
      const UF = record["UF"]?.trim() || "";
      const DDD1 = record["DDD1"]?.trim() || "";

      if (!headerMapping["CNPJ"]) {
        console.error("❌ ERRO: Coluna 'CNPJ' não encontrada no CSV.");
        return NextResponse.json({ error: "Coluna 'CNPJ' não encontrada." }, { status: 400 });
      }

      if (!CNPJ || !RAZAO_SOCIAL || !SITUACAO_CADASTRAL || !UF) {
        console.log("⚠️ Ignorando linha por falta de campos essenciais:", record);
        console.log("ℹ️ CNPJ:", CNPJ);
        console.log("ℹ️ RAZAO_SOCIAL:", RAZAO_SOCIAL);
        console.log("ℹ️ SITUACAO_CADASTRAL:", SITUACAO_CADASTRAL);
        //console.log("ℹ️ NATUREZA_JURIDICA:", NATUREZA_JURIDICA);
        //console.log("ℹ️ PORTE_EMPRESA:", PORTE_EMPRESA);
        //console.log("ℹ️ OPCAO_SIMPLES:", OPCAO_SIMPLES);
        //console.log("ℹ️ OPCAO_MEI:", OPCAO_MEI);
        console.log("ℹ️ UF:", UF);
        continue;
      }

      if (SITUACAO_CADASTRAL === "ATIVA") {
        writeStream.write(`${CNPJ}${delimiter}${RAZAO_SOCIAL}${delimiter}${SITUACAO_CADASTRAL}${delimiter}${NATUREZA_JURIDICA}${delimiter}${PORTE_EMPRESA}${delimiter}${OPCAO_SIMPLES}${delimiter}${OPCAO_MEI}${delimiter}${UF}${delimiter}${DDD1}\n`);
        //writeStream.write(`${CNPJ}${delimiter}${RAZAO_SOCIAL}${delimiter}${SITUACAO_CADASTRAL}${delimiter}${UF}${delimiter}${DDD1}\n`);
        verifiedCount++;
      }
    }

    writeStream.end();
    console.log(`✅ Processamento concluído! Linhas verificadas: ${verifiedCount}`);
    console.log(`📂 Arquivo verificado salvo em: ${verifiedFilePath}`);

    // 🔹 Salvar os detalhes no banco de dados
    await prisma.listfiles.create({
      data: {
        name: verifiedFileName,
        qtdregisters: verifiedCount,
        path: `/uploads/verifiedBRF/${verifiedFileName}`,
        extension: path.extname(file.name),
        origin: "BRF",
      },
    });

    return NextResponse.json({
      message: "CSV verificado com sucesso!",
      linhasVerificadas: verifiedCount,
      caminhoArquivo: `/uploads/verifiedBRF/${verifiedFileName}`,
    });
  } catch (error) {
    console.error("❌ Erro ao processar o CSV:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}