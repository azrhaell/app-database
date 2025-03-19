import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import prisma from "@/app/api/database/dbclient";

export async function POST(req: Request) {
  try {
    const { name, path: receivedPath } = await req.json();

    if (!name || !receivedPath) {
      return NextResponse.json({ error: "Nome ou caminho do arquivo inválido." }, { status: 400 });
    }

    // 🔹 Normaliza o caminho do arquivo
    const normalizedPath = path.normalize(receivedPath.replace(/\\/g, "/"));
    console.log("📩 Dados recebidos:", { name, receivedPath });
    console.log("📂 Caminho normalizado:", normalizedPath);

    // 🔹 Verifica se o arquivo existe no sistema de arquivos
    const absolutePath = path.join(process.cwd(), "public", normalizedPath);
    console.log("📁 Caminho absoluto do arquivo:", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado no sistema." }, { status: 404 });
    }

    // 🔹 Busca o arquivo na tabela listfiles
    const file = await prisma.listfiles.findFirst({
      where: { name: name, origin: "BRF", sincronized: false },
    });

    console.log("🔎 Arquivo encontrado no banco:", file);

    if (!file) {
      return NextResponse.json({ error: "Arquivo já sincronizado ou não cadastrado." }, { status: 404 });
    }

    // 🔹 Ler o arquivo CSV e extrair os dados necessários
    const organizationsData: { cnpj: string, rfstatus: string, legalnature: string, companysize: string, optionalsize: string, optionmei: string }[] = await new Promise((resolve, reject) => {
      const results: { cnpj: string, rfstatus: string, legalnature: string, companysize: string, optionalsize: string, optionmei: string }[] = [];
      fs.createReadStream(absolutePath)
        .pipe(csvParser({ separator: ";" })) // Ajuste para o delimitador correto
        .on("data", (data) => {
          if (data.CNPJ) {
            results.push({
              cnpj: data.CNPJ.replace(/\D/g, ""), // Remove caracteres não numéricos
              rfstatus: data.SITUACAO_CADASTRAL || "",
              legalnature: data.NATUREZA_JURIDICA || "",
              companysize: data.PORTE_EMPRESA || "",
              optionalsize: data.OPCAO_SIMPLES || "",
              optionmei: data.OPCAO_MEI || ""
            });
          }
        })
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });

    if (organizationsData.length === 0) {
      return NextResponse.json({ error: "Nenhum CNPJ encontrado no arquivo." }, { status: 400 });
    }

    console.log(`🔄 Atualizando ${organizationsData.length} CNPJs no banco...`);

    // 🔹 Atualiza os registros na tabela organizations
    const batchSize = 10000; // 🔹 Atualiza em lotes de 10.000 registros

    for (let i = 0; i < organizationsData.length; i += batchSize) {
      const batch = organizationsData.slice(i, i + batchSize);
      for (const org of batch) {
        await prisma.organizations.updateMany({
          where: { cnpj: org.cnpj },
          data: { 
            rfstatus: org.rfstatus,
            legalnature: org.legalnature,
            companysize: org.companysize,
            optionalsize: org.optionalsize == 'SIM' ? true : false,
            optionmei: org.optionmei == 'SIM' ? true : false,
          },
        });
      }
    
      console.log(`✅ Atualizados ${batch.length} registros (${i + batch.length}/${organizationsData.length})`);
    }

    // 🔹 Atualiza o status do arquivo na tabela listfiles
    await prisma.listfiles.update({
      where: { idFile: file.idFile },
      data: { sincronized: true },
    });

    return NextResponse.json({ message: `Sincronização concluída. ${organizationsData.length} CNPJs processados.` });
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return NextResponse.json({ error: "Erro ao processar a sincronização." }, { status: 500 });
  }
}