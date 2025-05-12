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
      where: { name, origin: "BDT", sincronized: false },
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
    const records: { N_LINHAS: string; FIDELIDADE: string; OPERADORA: string }[] = await new Promise((resolve, reject) => {
      const results: { N_LINHAS: string; FIDELIDADE: string; OPERADORA: string }[] = [];
      let headersProcessed = false;
    
      fs.createReadStream(absolutePath)
        .pipe(csvParser({ separator: delimiter, skipLines: 0 })) // 🔹 Mantém a primeira linha para tratamento manual do cabeçalho
        .on("headers", (headers) => {
          console.log("📌 Cabeçalho original:", headers);
        
          // 🔹 Remove delimitador extra no final, se houver
          const lastHeader = headers[headers.length - 1];
          if (lastHeader === "" || lastHeader.trim() === "") {
            headers.pop();
            console.log("⚠️ Delimitador extra removido do cabeçalho!");
          }
        
          // 🔹 Verifica se os headers esperados estão corretos
          const expectedHeaders = ["CNPJ", "RAZAO_SOCIAL", "UF", "N_LINHAS", "OPERADORA", "FIDELIDADE"];
          if (!expectedHeaders.every(h => headers.includes(h))) {
            console.error("❌ Cabeçalho do CSV está incorreto:", headers);
            throw new Error("Cabeçalho do CSV inválido. Verifique se os campos estão corretos.");
          }
        
          headersProcessed = true;
        })
        
        .on("data", (data) => {
          if (!headersProcessed) return; // 🔹 Garante que o cabeçalho foi tratado antes de processar dados
        
          if (data.N_LINHAS && data.FIDELIDADE && data.OPERADORA) {
            try {
              // 🔹 Verifica se o valor da fidelidade é uma data válida
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(data.FIDELIDADE)) {
                const [day, month, year] = data.FIDELIDADE.split("/");
                data.FIDELIDADE = `${year}-${month}-${day}T00:00:00.000Z`;
              } else {
                console.warn(`⚠️ Valor inesperado na coluna FIDELIDADE: ${data.FIDELIDADE} (esperado: DD/MM/YYYY)`);
                return; // 🔹 Ignora linhas com valores inválidos
              }
        
              results.push({
                N_LINHAS: data.N_LINHAS.replace(/\D/g, ""), // 🔹 Remove não numéricos
                FIDELIDADE: data.FIDELIDADE,
                OPERADORA: data.OPERADORA,
              });
        
            } catch (error) {
              console.error(`❌ Erro ao processar linha: ${JSON.stringify(data)}`, error);
            }
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
        batch.map(({ N_LINHAS, FIDELIDADE, OPERADORA }) =>
          prisma.organizations.updateMany({
            where: {
              mobilephone1: N_LINHAS,
              startofcontract: { lt: new Date(FIDELIDADE) }, // 🔹 Só atualiza se startofcontract for mais antigo que FIDELIDADE
            },
            data: {
              startofcontract: new Date(FIDELIDADE),
              operatorname: OPERADORA,
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
