// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    const START_DATE = new Date("2023-07-01T00:00:00.000Z");
    const END_DATE = new Date("2024-03-31T23:59:59.999Z");
    //const targetOperators = ["41", "Tim"]; //TIM
    //const targetOperators = ["21", "36", "20", "CLARO"]; //CLARO
    const targetOperators = ["21", "36", "20", "CLARO", "41", "Tim"]; //CLARO

    const PAGE_SIZE = 10000;
    const MAX_RESULTS = 5000000;

    const allOrganizations: Array<{
      id: number;
      name: string;
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

      allOrganizations.push(...batch.map(org => ({
              id: org.idCompany, // Corrected property name
              name: org.companyname || "Unknown", // Provide a default value for null
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
              updatedat: org.updatedat || new Date("1900-01-01"), // Default value for null
              numberlines: org.numberlines || 0,
              email1: org.email1 || "",
              relatednumbers: org.relatednumbers.map(num => ({
                id: num.idNumber, // Corrected property name
                operatorname: num.operatorname,
                startofcontract: num.startofcontract || new Date("1900-01-01"), // Default value for null
              })),
            })));
      page++;

      if (allOrganizations.length >= MAX_RESULTS) break;
    }

    if (allOrganizations.length === 0) {
      return NextResponse.json({ message: "Nenhuma organização encontrada." }, { status: 404 });
    }

    const result: typeof allOrganizations = allOrganizations.filter((org) => {
      const numbers = org.relatednumbers;
      if (!numbers || numbers.length === 0 || numbers.length > 150) return false;

      const countTarget = numbers.filter(n =>
        n.operatorname && targetOperators.includes(n.operatorname)
      ).length;

      const percentage = (countTarget / numbers.length) * 100;
      return percentage >= 60;
    });

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
