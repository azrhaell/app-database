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

    const file = await prisma.listfiles.findFirst({
      where: { name, origin: "BRF", sincronized: false },
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo já sincronizado ou não cadastrado." }, { status: 404 });
    }

    const firstLine = fs.readFileSync(absolutePath, "utf8").split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";

    const headerMapping: Record<string, string> = {};

    interface FederalRevenueData {
      cnpj: string;
      branchoffice: boolean;
      reasonrfstatus: string;
      cnaecode: string;
      cnaedescription: string;
      cnaedescriptionsecondary: string;
      typestreet: string;
      address: string;
      number: string;
      complement: string;
      ddd2: string;
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
      phone2: string;
      qualifyresponsible: string;
      rfstatus: string;
      legalnature: string;
      companysize: string;
      optionalsize: boolean;
      optionmei: boolean;
    }

    let batch: FederalRevenueData[] = [];
    const BATCH_SIZE = 10000;
    const pendingBatches: (() => Promise<void>)[] = [];

    function pLimit(concurrency: number) {
      const queue: (() => Promise<void>)[] = [];
      let activeCount = 0;

      const next = () => {
        if (queue.length === 0 || activeCount >= concurrency) return;
        activeCount++;
        const fn = queue.shift();
        if (fn) {
          fn().finally(() => {
            activeCount--;
            next();
          });
        }
      };

      return (fn: () => Promise<void>) => {
        return new Promise<void>((resolve) => {
          queue.push(async () => {
            await fn();
            resolve();
          });
          next();
        });
      };
    }

    const limit = pLimit(5);

    const validStates = new Set([
      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
      "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
      "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ]);

    function checkFieldLengths(org: Partial<FederalRevenueData>) {
      const fieldLimits: Record<string, number> = {
        companyname: 255, businessname: 255, reasonrfstatus: 10,
        cnaecode: 10, cnaedescription: 255, cnaedescriptionsecondary: 255,
        typestreet: 10, address: 255, number: 20, complement: 50,
        ddd2: 2, ddd_fax: 2, fax: 13, email1: 60, partners: 255,
        neighborhood: 100, city: 100, state: 2, cep: 8, ddd1: 2,
        phone1: 13, phone2: 13, qualifyresponsible: 100, rfstatus: 10,
        legalnature: 255, companysize: 255,
      };

      for (const [field, limit] of Object.entries(fieldLimits)) {
        const value = org[field as keyof FederalRevenueData];
        if (value && typeof value === "string" && value.length > limit) {
          console.warn(`⚠️ Campo '${field}' excedeu o limite (${limit}): valor="${value}"`);
        }
      }
    }

    function isValidDDD(value: string): boolean {
      const num = parseInt(value, 10);
      return /^\d{2}$/.test(value) && num >= 10 && num <= 99;
    }

    function isValidState(value: string): boolean {
      return validStates.has(value.toUpperCase());
    }

    function safeString(value: unknown, maxLength: number, field?: string): string {
      if (typeof value !== "string") return "";

      const trimmed = value.trim();
      if (field === "ddd1" || field === "ddd2" || field === "ddd_fax") {
        return isValidDDD(trimmed) ? trimmed : "";
      }

      if (field === "state") {
        return isValidState(trimmed) ? trimmed.toUpperCase() : "";
      }

      return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
    }

    async function processBatch(batch: FederalRevenueData[]) {
      console.log(`🔄 Processando lote de ${batch.length} registros...`);
      try {
        const safeBatch = batch.map(org => {
          checkFieldLengths(org);
          return {
            cnpj: org.cnpj.trim(),
            companyname: safeString(org.companyname, 255),
            branchoffice: org.branchoffice,
            businessname: safeString(org.businessname, 255),
            creatorId: 1,
            reasonrfstatus: safeString(org.reasonrfstatus, 10),
            cnaecode: safeString(org.cnaecode, 10),
            cnaedescription: safeString(org.cnaedescription, 255),
            cnaedescriptionsecondary: safeString(org.cnaedescriptionsecondary, 255),
            typestreet: safeString(org.typestreet, 10),
            address: safeString(org.address, 255),
            number: safeString(org.number, 20),
            complement: safeString(org.complement, 50),
            ddd2: safeString(org.ddd2, 2, "ddd2"),
            ddd_fax: safeString(org.ddd_fax, 2, "ddd_fax"),
            fax: safeString(org.fax, 13),
            email1: safeString(org.email1, 60),
            partners: safeString(org.partners, 255),
            capital: org.capital ? parseFloat(org.capital.replace(/[^\d.-]/g, "")) || 0 : 0,
            neighborhood: safeString(org.neighborhood, 100),
            city: safeString(org.city, 100),
            state: safeString(org.state, 2, "state"),
            cep: safeString(org.cep, 8),
            ddd1: safeString(org.ddd1, 2, "ddd1"),
            phone1: safeString(org.phone1, 13),
            phone2: safeString(org.phone2, 13),
            qualifyresponsible: safeString(org.qualifyresponsible, 100),
            rfstatus: safeString(org.rfstatus, 10),
            legalnature: safeString(org.legalnature, 255),
            companysize: safeString(org.companysize, 255),
            optionalsize: org.optionalsize,
            optionmei: org.optionmei,
          };
        });

        await prisma.federalrevenue.createMany({
          data: safeBatch,
          skipDuplicates: true,
        });

        console.log(`✅ Lote inserido com sucesso.`);
      } catch (error) {
        console.error("❌ Erro ao inserir lote:", error);
      }
    }

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(absolutePath)
        .pipe(parse({
          separator: delimiter,
          mapHeaders: ({ header }) => {
            const normalizedHeader = header.trim().toUpperCase();
            headerMapping[normalizedHeader] = header;
            return normalizedHeader;
          },
        }))
        .on("data", (data) => {
          const cnpj = data["CNPJ"] ? data["CNPJ"].replace(/\D/g, "") : "";
          if (cnpj) {
            batch.push({
              cnpj,
              branchoffice: (data["MATRIZ_FILIAL"] || "").toUpperCase() === "FILIAL",
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
              capital: data["CAPITAL_SOCIAL"] || "",
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
              optionalsize: (data["OPCAO_SIMPLES"] || "").toUpperCase() === "SIM",
              optionmei: (data["OPCAO_MEI"] || "").toUpperCase() === "SIM",
            });

            if (batch.length >= BATCH_SIZE) {
              const currentBatch = [...batch];
              pendingBatches.push(() => processBatch(currentBatch));
              batch = [];
            }
          }
        })
        .on("end", async () => {
          if (batch.length > 0) {
            pendingBatches.push(() => processBatch(batch));
          }

          console.log(`🧩 Total de lotes: ${pendingBatches.length}`);

          await Promise.all(pendingBatches.map(fn => limit(fn)));
          resolve();
        })
        .on("error", (error) => {
          console.error("❌ Erro na leitura do CSV:", error);
          reject(error);
        });
    });

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
