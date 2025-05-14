// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    const START_DATE = new Date("2023-07-01T00:00:00.000Z");
    const END_DATE = new Date("2024-03-31T23:59:59.999Z");

    // Operadoras-alvo
    const targetOperators = ["21", "36", "20", "CLARO", "41", "Tim"];

    const PAGE_SIZE = 10000;
    const MAX_RESULTS = 1000000;

    const result: Array<{
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
      relatednumbers: Array<{
        id: number;
        operatorname: string | null;
        startofcontract: Date;
      }>;
    }> = [];

    let page = 0;

    while (true) {
      const batch = await prisma.organizations.findMany({
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          relatednumbers: {
            where: {
              startofcontract: {
                gte: START_DATE,
                lte: END_DATE,
              },
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
              operatorname: num.operatorname,
              startofcontract: num.startofcontract || new Date("1900-01-01"),
            })),
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

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro ao processar GET /readyfiltercnpj:", error);

    const errorMessage = error instanceof Error ? error.toString() : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      message: "Erro interno do servidor",
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}
