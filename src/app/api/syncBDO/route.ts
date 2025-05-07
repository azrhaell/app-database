import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import readline from "readline";
import prisma from "@/app/api/database/dbclient";

export async function POST(req: Request) {
  try {
    const { name, path: receivedPath } = await req.json();

    if (!name || !receivedPath) {
      return NextResponse.json({ error: "Nome ou caminho do arquivo inválido." }, { status: 400 });
    }

    const normalizedPath = path.normalize(receivedPath.replace(/\\/g, "/"));
    const absolutePath = path.join(process.cwd(), "public", normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado no sistema." }, { status: 404 });
    }

    const file = await prisma.listfiles.findFirst({
      where: { name, origin: "BDO", sincronized: false },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo já sincronizado ou não cadastrado." }, { status: 404 });
    }

    const detectDelimiter = async (filePath: string): Promise<string> => {
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      for await (const line of rl) {
        if (line.includes(";")) return ";";
        if (line.includes(",")) return ",";
        break;
      }

      return ";";
    };

    const delimiter = await detectDelimiter(absolutePath);
    console.log(`📌 Delimitador detectado: "${delimiter}"`);

    const dddsPermitidos = ["21", "22", "24", "27", "28"];
    const filteredFilePath = absolutePath.replace(".csv", "_filtered.csv");
    const writeStream = fs.createWriteStream(filteredFilePath);
    writeStream.write("number,operadora,datahora\n");

    const records: { number: string; datahora: string; operadora: string }[] = await new Promise((resolve, reject) => {
      const results: { number: string; datahora: string; operadora: string }[] = [];
      let isHeaderChecked = false;

      fs.createReadStream(absolutePath)
        .pipe(csvParser({ separator: delimiter }))
        .on("data", (data) => {
          if (!isHeaderChecked) {
            const requiredFields = ["number", "operadora", "datahora"];
            const headers = Object.keys(data);
            const hasAllFields = requiredFields.every(field => headers.includes(field));

            if (!hasAllFields) {
              reject(new Error("Cabeçalho inválido no arquivo CSV."));
              return;
            }
            isHeaderChecked = true;
          }

          if (data.number && data.datahora && data.operadora) {
            const ddd = data.number.replace(/\D/g, "").slice(0, 2);
            if (dddsPermitidos.includes(ddd)) {
              const cleanedNumber = data.number.replace(/\D/g, "");
              results.push({
                number: cleanedNumber,
                datahora: data.datahora,
                operadora: data.operadora,
              });
              writeStream.write(`${cleanedNumber},${data.operadora},${data.datahora}\n`);
            }
          }
        })
        .on("end", () => {
          writeStream.end();
          resolve(results);
        })
        .on("error", (error) => reject(error));
    });

    if (records.length === 0) {
      return NextResponse.json({ error: "Nenhum dado válido encontrado no arquivo." }, { status: 400 });
    }

    // 🧹 Limpa todos os registros existentes na tabela BDO antes da inserção
    await prisma.bdo.deleteMany();
    console.log("📌 Todos os registros da tabela BDO foram removidos.");
        
    console.log(`📌 Inserindo ${records.length} registros na tabela BDO...`);

    const batchSize = 10000;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(({ number, datahora, operadora }) =>
          prisma.bdo.create({
            data: {
              number,
              date: new Date(datahora),
              codeoperador: operadora,
              disabled: false,
            },
          })
        )
      );

      let successCount = 0;
      let failureCount = 0;

      results.forEach((result, idx) => {
        const record = batch[idx];
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failureCount++;
          console.error(`❌ Erro ao inserir número ${record.number} (operadora: ${record.operadora}, data: ${record.datahora}):`);
          console.error(result.reason);
        }
      });

      console.log(`✅ Batch concluído: ${successCount} inseridos com sucesso, ${failureCount} com erro (${i + batch.length}/${records.length})`);
    }

    await prisma.listfiles.update({
      where: { idFile: file.idFile },
      data: { sincronized: true },
    });

    return NextResponse.json({
      message: `Sincronização concluída. ${records.length} registros processados.`,
      filteredFilePath,
    });

  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return NextResponse.json({ error: "Erro ao processar a sincronização." }, { status: 500 });
  }
}
