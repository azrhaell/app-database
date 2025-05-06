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
    let federalrevenueData: {
      cnpj: string;
      branchoffice: boolean;

      //daterfstatus: Date;
      reasonrfstatus: string;
      //openingdate: Date;
      cnaecode: string;
      cnaedescription: string;
      cnaedescriptionsecondary: string;
      typestreet: string;
      address: string;
      number: string;
      complement: string;
      ddd_fax: string;
      fax: string;
      email1: string;
      capital: string;
      partners: string;

      companyname: string;
      businessname: string;
      neighborhood: string;
      city: string;
      state: string;
      cep: string;
      ddd1: string;
      phone1: string;
      ddd2: string;
      phone2: string;
      qualifyresponsible: string;
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
            federalrevenueData.push({
              cnpj,
              branchoffice:  (data["MATRIZ_FILIAL"] || "").toUpperCase() === "filial" ? true : false,

              reasonrfstatus: data["MOTIVO_SITUACAO_CADASTRAL"] || "",
              cnaecode: data["CNAE_CODIGO"] || "",
              cnaedescription: data["CNAE_FISCAL"] || "",
              cnaedescriptionsecondary: data["CNAE_FISCAL_SECUNDARIA"] || "",
              typestreet: data["TIPO_LOGRADOURO"] || "",
              address: data["LOGRADOURO"] || "",
              number: data["NUMERO"] || "",
              complement: data["COMPLEMENTO"] || "",
              ddd2: data["DDD2"] || "",
              ddd_fax: data["DDD_FAX"] || "",
              fax: data["FAX"] || "",
              email1: data["CORREIO_ELETRONICO"] || "",
              capital:  data["CAPITAL_SOCIAL"] || "",
              partners: data["SOCIOS"] || "",

              companyname: data["RAZAO_SOCIAL"] || "",
              businessname: data["NOME_FANTASIA"] || "",
              neighborhood: data["BAIRRO"] || "",
              city: data["MUNICIPIO"] || "",
              state: data["UF"] || "",
              cep: data["CEP"] || "",
              ddd1: data["DDD1"] || "",
              phone1: data["TELEFONE1"] || "",
              phone2: data["TELEFONE2"] || "",
              qualifyresponsible: data["QUALIFICACAO_RESPONSAVEL"] || "",
              rfstatus: data["SITUACAO_CADASTRAL"] || "",
              legalnature: data["NATUREZA_JURIDICA"] || "",
              companysize: data["PORTE_EMPRESA"] || "",
              optionalsize: (data["OPCAO_SIMPLES"] || "").toUpperCase() === "SIM" ? true : false,
              optionmei: (data["OPCAO_MEI"] || "").toUpperCase() === "SIM" ? true : false,
            });

            // 🔹 Processa em lotes de 10.000 registros para evitar sobrecarga
            if (federalrevenueData.length >= 10000) {
              processBatch(federalrevenueData);
              federalrevenueData = [];
            }
          }
        })
        .on("headers", (headers) => console.log("🔍 Cabeçalhos detectados:", headers))
        .on("end", async () => {
          console.log(`✅ Leitura finalizada. Total de registros lidos: ${federalrevenueData.length}`);
          if (federalrevenueData.length > 0) await processBatch(federalrevenueData);
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
function checkFieldLengths(org: any) {
  const fieldLimits: Record<string, number> = {
    companyname: 255,
    businessname: 255,

    reasonrfstatus: 10,
    cnaecode: 10,
    cnaedescription: 255,
    cnaedescriptionsecondary: 255,
    typestreet: 10,
    address: 255,
    number: 20,
    complement: 50,
    ddd2: 2,
    ddd_fax: 2,
    fax: 13,
    email1: 60,
    partners: 255,

    neighborhood: 100,
    city: 100,
    state: 2,
    cep: 8,
    ddd1: 3,
    phone1: 13,
    phone2: 13,
    qualifyresponsible: 100,
    rfstatus: 10,
    legalnature: 255,
    companysize: 255,
  };

  for (const [field, limit] of Object.entries(fieldLimits)) {
    const value = org[field];

    if (value === null || value === undefined) {
      console.warn(`⚠️ Campo '${field}' está com valor nulo ou indefinido.`);
    } else if (typeof value === "string" && value.length > limit) {
      console.warn(`⚠️ Campo '${field}' excedeu o limite (${limit}): valor="${value}" (${value.length} caracteres)`);
    }
  }

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeString(value: any, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBatch(batch: any[]) {
  console.log(`🔄 Processando lote de ${batch.length} registros...`);

  try {
    for (const org of batch) {
      try {
        checkFieldLengths(org); // ← Verifica antes de salvar
        await prisma.federalrevenue.updateMany({
          where: {
            cnpj: org.cnpj.trim(),
          },
          data: {
            companyname: safeString(org.companyname,255),
            branchoffice: org.branchoffice,
            businessname: safeString(org.businessname,255),

            reasonrfstatus: safeString(org.reasonrfstatus,10),
            cnaecode: safeString(org.cnaecode, 10),
            cnaedescription: safeString(org.cnaedescription, 255),
            cnaedescriptionsecondary: safeString(org.cnaedescriptionsecondary, 255),
            typestreet: safeString(org.typestreet, 10),
            address: safeString(org.address, 255),
            number: safeString(org.address, 20),
            complement: safeString(org.complement, 50),
            ddd2: safeString(org.ddd2, 2),
            ddd_fax: safeString(org.ddd_fax, 2),
            fax: safeString(org.fax, 13),
            email1: safeString(org.email1, 60),
            partners: safeString(org.partners, 255),
            capital: org.capital,

            neighborhood: safeString(org.neighborhood,100),
            city: safeString(org.city,100),
            state: safeString(org.state,2),
            cep: safeString(org.cep,8),
            ddd1: safeString(org.ddd1,2),
            phone1: safeString(org.phone1,13),
            phone2: safeString(org.phone2,13),
            qualifyresponsible: safeString(org.qualifyresponsible,100),
            rfstatus: safeString(org.rfstatus,10),
            legalnature: safeString(org.legalnature,255),
            companysize: safeString(org.companysize,255),
            optionalsize: org.optionalsize,
            optionmei: org.optionmei,
          },
        });
      } catch (err) {
        console.error(`❌ Erro ao atualizar o CNPJ ${org.cnpj}:`, err);
        console.warn('🔍 Dados recebidos:', JSON.stringify(org, null, 2));
      }
    }

    console.log(`✅ Lote de registros atualizado com sucesso.`);
  } catch (error) {

    console.error("❌ Erro ao processar lote:", error);

  }
}