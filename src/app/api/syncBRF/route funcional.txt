import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import parse from "csv-parser";
import prisma from "@/app/api/database/dbclient";

export async function POST(req: Request) {
  try {
    const { name, path: receivedPath } = await req.json();

    if (!name || !receivedPath) {
      return NextResponse.json({ error: "Nome ou caminho do arquivo inválido." }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), "public", receivedPath);
    console.log("📁 Caminho absoluto do arquivo:", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    // 🔹 Verifica se o arquivo já foi sincronizado
    const file = await prisma.listfiles.findFirst({
      where: { name, origin: "BRF", sincronized: false },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo já sincronizado ou não cadastrado." }, { status: 404 });
    }

    // 🔹 Determinar delimitador (pode ser ";" ou ",")
    const firstLine = fs.readFileSync(absolutePath, "utf8").split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";
    console.log(`🔍 Delimitador detectado: '${delimiter}'`);

    const headerMapping: Record<string, string> = {};
    let organizationsData: {
      cnpj: string;
      rfstatus: string;
      legalnature: string;
      companysize: string;
      optionalsize: boolean;
      optionmei: boolean;
    }[] = [];

    // 🔹 Lendo e processando o CSV de forma otimizada
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(absolutePath)
      .pipe(
        parse({
          separator: delimiter,
          mapHeaders: ({ header }) => {
            const normalizedHeader = header.trim().toUpperCase();
            headerMapping[normalizedHeader] = header;
            return normalizedHeader;
          },
        })
      )
        .on("data", (data) => {
          const cnpj = data["CNPJ"] ? data["CNPJ"].replace(/\D/g, "") : "";
          if (cnpj) {
            organizationsData.push({
              cnpj,
              rfstatus: data["SITUACAO_CADASTRAL"] || "",
              legalnature: data["NATUREZA_JURIDICA"] || "",
              companysize: data["PORTE_EMPRESA"] || "",
              optionalsize: (data["OPCAO_SIMPLES"] || "").toUpperCase() === "SIM" ? true : false,
              optionmei: (data["OPCAO_MEI"] || "").toUpperCase() === "SIM" ? true : false,
            });

            // 🔹 Processa em lotes de 10.000 registros para evitar sobrecarga
            if (organizationsData.length >= 10000) {
              processBatch(organizationsData);
              organizationsData = [];
            }
          }
        })
        .on("headers", (headers) => console.log("🔍 Cabeçalhos detectados:", headers))
        .on("end", async () => {
          console.log(`✅ Leitura finalizada. Total de registros lidos: ${organizationsData.length}`);
          if (organizationsData.length > 0) await processBatch(organizationsData);
          resolve();
        })
        .on("error", (error) => {
          console.error("❌ Erro na leitura do CSV:", error);
          reject(error);
        });
    });

    // 🔹 Atualiza o status do arquivo
    await prisma.listfiles.update({
      where: { idFile: file.idFile },
      data: { sincronized: true },
    });

    return NextResponse.json({ message: "Sincronização concluída com sucesso!" });
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return NextResponse.json({ error: "Erro ao processar a sincronização." }, { status: 500 });
  }
}

// 📌 Função para processar lotes de registros de forma eficiente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBatch(batch: any[]) {
  console.log(`🔄 Processando lote de ${batch.length} registros...`);

  try {
    for (const org of batch) {
      //console.log(`🔍 Atualizando CNPJ: ${org.cnpj}...`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await prisma.organizations.updateMany({
        where: {
          cnpj: {
            equals: org.cnpj.trim(), // Remove espaços em branco extras
          },
        },
        data: {
          rfstatus: org.rfstatus,
          legalnature: org.legalnature,
          companysize: org.companysize,
          optionalsize: org.optionalsize,
          optionmei: org.optionmei,
        },
      });

      // 🔹 Verifica se algum registro foi atualizado
      /*if (result.count >= 1) {
        console.warn(`✅ Registro encontrado para CNPJ: ${org.cnpj}`);
      }*/

    }

    console.log(`✅ Lote de registros atualizado com sucesso.`);
  } catch (error) {

    console.error("❌ Erro ao processar lote:", error);

  }
}