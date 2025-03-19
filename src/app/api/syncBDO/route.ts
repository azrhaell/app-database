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

    // 🔹 Normaliza e valida o caminho
    const normalizedPath = path.normalize(receivedPath.replace(/\\/g, "/"));
    const absolutePath = path.join(process.cwd(), "public", normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado no sistema." }, { status: 404 });
    }

    // 🔹 Busca o arquivo na tabela listfiles
    const file = await prisma.listfiles.findFirst({
      where: { name, origin: "BDO", sincronized: false },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo já sincronizado ou não cadastrado." }, { status: 404 });
    }

    // 🔹 Detecta o delimitador do CSV
    const detectDelimiter = async (filePath: string): Promise<string> => {
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      for await (const line of rl) {
        if (line.includes(";")) return ";";
        if (line.includes(",")) return ",";
        break;
      }

      return ";"; // 🔹 Padrão caso não consiga detectar
    };

    const delimiter = await detectDelimiter(absolutePath);
    console.log(`📌 Delimitador detectado: "${delimiter}"`);

    // 🔹 Ler o arquivo CSV
    const records: { number: string; datahora: string; operadora: string }[] = await new Promise((resolve, reject) => {
      const results: { number: string; datahora: string; operadora: string }[] = [];
      fs.createReadStream(absolutePath)
        .pipe(csvParser({ separator: delimiter })) // Usa o delimitador detectado
        .on("data", (data) => {
          if (data.number && data.datahora && data.operadora) {
            results.push({
              number: data.number.replace(/\D/g, ""), // Remove não numéricos
              datahora: data.datahora,
              operadora: data.operadora,
            });
          }
        })
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });

    if (records.length === 0) {
      return NextResponse.json({ error: "Nenhum dado válido encontrado no arquivo." }, { status: 400 });
    }

    console.log(`🔄 Comparando ${records.length} registros com a base de dados...`);

    // 🔹 Atualiza os registros na tabela organizations
    const batchSize = 10000;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
    
      await prisma.$transaction(
        batch.map(({ number, datahora, operadora }) =>
          prisma.organizations.updateMany({
            where: {
              mobilephone1: number,
              startofcontract: { lt: new Date(datahora) }, // 🔹 Só atualiza se startofcontract for mais antigo que datahora
            },
            data: {
              startofcontract: new Date(datahora),
              operatorname: operadora,
            },
          })
        )
      );
    
      console.log(`✅ Atualizados ${batch.length} registros (${i + batch.length}/${records.length})`);
    }
    

    // 🔹 Atualiza o status do arquivo na tabela listfiles
    await prisma.listfiles.update({
      where: { idFile: file.idFile },
      data: { sincronized: true },
    });

    return NextResponse.json({ message: `Sincronização concluída. ${records.length} registros processados.` });
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return NextResponse.json({ error: "Erro ao processar a sincronização." }, { status: 500 });
  } //finally {
  //  await prisma.$disconnect();
  //}
}
