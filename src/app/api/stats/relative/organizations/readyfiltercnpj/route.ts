// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

type RelatedNumber = {
  id: number;
  mobilephone1: string | null;
  operatorname: string | null;
  previousoperator: string | null;
  startofcontract: Date;
  ported: boolean;
};

type OrganizationResult = {
  id: number;
  name: string;
  cnpj: string;
  companyname: string;
  businessname: string;
  city: string;
  state: string;
  rfstatus: string;
  legalnature: string;
  companysize: string;
  optionalsize: boolean;
  optionmei: boolean;
  updatedat: Date;
  numberlines: number;
  email1: string;
  relatednumbers: RelatedNumber[];
  base: string | null;
};

export async function GET() {
  try {
    const START_DATE = new Date("2023-07-01T00:00:00.000Z");
    const END_DATE = new Date("2024-03-31T23:59:59.999Z");

    const targetOperators = ["21", "36", "CLARO", "41", "Tim"];
    const PAGE_SIZE = 10000;
    const MAX_RESULTS = 1000000;

    const result: OrganizationResult[] = [];

    let page = 0;

    while (true) {
      const batch = await prisma.organizations.findMany({
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        where: {
          rfstatus: 'ATIVA',
        },
        include: {
          relatednumbers: {
            where: {
              startofcontract: {
                gte: START_DATE,
                lte: END_DATE,
              },
              ported: true,
            },
          },
        },
      });

      if (batch.length === 0) break;

      for (const org of batch) {
        const numbers = org.relatednumbers;

        if (!numbers || numbers.length === 0 || numbers.length > 150) continue;

        const countTarget = numbers.filter(n =>
          n.operatorname && targetOperators.includes(n.operatorname)
        ).length;

        const percentage = (countTarget / numbers.length) * 100;

        if (percentage >= 60) {
          result.push({
            id: org.idCompany,
            name: org.companyname || "Unknown",
            cnpj: org.cnpj,
            companyname: org.companyname || "",
            businessname: org.businessname || "",
            city: org.city || "",
            state: org.state || "",
            rfstatus: org.rfstatus || "",
            legalnature: org.legalnature || "",
            companysize: org.companysize || "",
            optionalsize: org.optionalsize || false,
            optionmei: org.optionmei || false,
            updatedat: org.updatedat || new Date("1900-01-01"),
            numberlines: org.numberlines || 0,
            email1: org.email1 || "",
            relatednumbers: numbers.map(num => ({
              id: num.idNumber,
              mobilephone1: num.mobilephone1,
              operatorname: num.operatorname,
              previousoperator: num.previousoperator,
              startofcontract: num.startofcontract || new Date("1900-01-01"),
              ported: num.ported || false,
            })),
            base: null, // será preenchido depois
          });
        }

        if (result.length >= MAX_RESULTS) break;
      }

      if (result.length >= MAX_RESULTS) break;

      page++;
    }

    if (result.length === 0) {
      return NextResponse.json({ message: "Nenhuma organização encontrada." }, { status: 404 });
    }

    // Correção de CNPJs (remoção de notação científica)
    const sanitizeCNPJ = (cnpj: string) => {
      return String(parseInt(cnpj)).padStart(14, "0");
    };

    // Mapeia CNPJs com contagem de operadores
    const contagens = new Map<string, Record<string, number>>();

    for (const org of result) {
      const cnpj = sanitizeCNPJ(org.cnpj);
      for (const num of org.relatednumbers) {
        const operadora = num.operatorname;
        if (!operadora) continue;

        if (!contagens.has(cnpj)) {
          contagens.set(cnpj, {});
        }

        const operadoras = contagens.get(cnpj)!;
        operadoras[operadora] = (operadoras[operadora] || 0) + 1;
      }
    }

    // Identifica operadora mais frequente
    const baseOperadora = new Map<string, string>();

    for (const [cnpj, operadores] of contagens.entries()) {
      const maisFrequente = Object.entries(operadores)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (maisFrequente) {
        baseOperadora.set(cnpj, maisFrequente);
      }
    }

    // Adiciona ao resultado
    for (const org of result) {
      const cnpj = sanitizeCNPJ(org.cnpj);
      org.base = baseOperadora.get(cnpj) || null;
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro ao processar GET /readyfiltercnpj:", error);

    const errorMessage = error instanceof Error ? error.toString() : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
