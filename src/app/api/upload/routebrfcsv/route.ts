import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import parse from "csv-parser";
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

    const batchSize = 5000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let batch: any[] = [];
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

      if (!CNPJ || !RAZAO_SOCIAL || !SITUACAO_CADASTRAL || !UF) {
        console.log("⚠️ Ignorando linha por falta de campos essenciais:", record);
        continue;
      }

      if (SITUACAO_CADASTRAL === "ATIVA") {
        batch.push({ CNPJ, RAZAO_SOCIAL, SITUACAO_CADASTRAL, NATUREZA_JURIDICA, PORTE_EMPRESA, OPCAO_SIMPLES, OPCAO_MEI, UF, DDD1 });
        writeStream.write(`${CNPJ}${delimiter}${RAZAO_SOCIAL}${delimiter}${SITUACAO_CADASTRAL}${delimiter}${NATUREZA_JURIDICA}${delimiter}${PORTE_EMPRESA}${delimiter}${OPCAO_SIMPLES}${delimiter}${OPCAO_MEI}${delimiter}${UF}${delimiter}${DDD1}\n`);
        verifiedCount++;
      }

      if (batch.length >= batchSize) {
        await prisma.listfiles.createMany({ data: batch });
        batch = [];
        console.log("🔹 Batch parcial salvo no banco de dados");
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    if (batch.length > 0) {
      await prisma.listfiles.createMany({ data: batch });
    }

    writeStream.end();
    console.log(`✅ Processamento concluído! Linhas verificadas: ${verifiedCount}`);
    console.log(`📂 Arquivo verificado salvo em: ${verifiedFilePath}`);

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
