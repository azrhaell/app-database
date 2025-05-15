// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    const targetOperators = ["21", "36", "20", "41", "CLARO", "Tim"];
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
        mobilephone1: string | null;
        operatorname: string | null;
        previousoperator: string | null;
        ported: boolean;
      }>;
    }> = [];

    let page = 0;

    while (true) {
      const batch = await prisma.organizations.findMany({
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        where: {
          relatednumbers: {
            some: {
              mobilephone1: {
                not: null,
              },
            },
          },
        },
        include: {
          relatednumbers: true, // sem filtro por data
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
              previousoperator: num.previousoperator || null,
              ported: num.ported || false,
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
    if (error instanceof Error) {
      console.error("Erro ao filtrar CNPJs:", error.message);
      return NextResponse.json(
        {
          message: "Erro interno do servidor.",
          error: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    } else {
      console.error("Erro ao filtrar CNPJs:", error);
      return NextResponse.json(
        {
          message: "Erro interno do servidor.",
          error: String(error),
        },
        { status: 500 }
      );
    }
  }
}
