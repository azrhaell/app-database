// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    const targetOperators = ["21", "36", "20", "41", "CLARO", "Tim"];
    const PAGE_SIZE = 10000;
    const MAX_RESULTS = 750000;

    const allOrganizations: Array<{ id: number; relatednumbers: Array<{idNumber: number; mobilephone1: string | null; operatorname: string | null }> }> = [];
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

      const filtered = batch.filter((org) => {
        const numbers = org.relatednumbers;
        if (!numbers || numbers.length === 0 || numbers.length > 150) return false;

        const countTarget = numbers.filter((n) =>
          n.operatorname && targetOperators.includes(n.operatorname)
        ).length;

        const percentage = (countTarget / numbers.length) * 100;
        return percentage >= 60;
      });

      allOrganizations.push(...filtered.map(org => ({
              id: org.idCompany, // Ensure the 'id' property is included
              relatednumbers: org.relatednumbers.map(num => ({
                idNumber: num.idNumber, // Include the 'idNumber' property
                mobilephone1: num.mobilephone1,
                operatorname: num.operatorname,
              })),
            })));
      page++;

      if (allOrganizations.length >= MAX_RESULTS) break;
    }

    if (allOrganizations.length === 0) {
      return NextResponse.json({ message: "Nenhuma organização encontrada." }, { status: 404 });
    }

    return NextResponse.json(allOrganizations, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro ao filtrar CNPJs:", error.message);
    } else {
      console.error("Erro ao filtrar CNPJs:", error);
    }
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Erro interno do servidor.",
          error: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    } else {
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
