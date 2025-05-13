// app/api/stats/relative/organizations/readyfiltercnpj/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";

export async function GET() {
  try {
    const targetOperators = ["21", "36", "20", "41", "CLARO", "Tim"];

    const PAGE_SIZE = 500;
    const MAX_RESULTS = 1000000; // Limite de segurança opcional

    let allFiltered: Awaited<ReturnType<typeof prisma.organizations.findMany>> = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore && allFiltered.length < MAX_RESULTS) {
      const organizations = await prisma.organizations.findMany({
        skip,
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
          relatednumbers: true, // Inclui todos os números, sem filtrar por data
        },
      });

      if (organizations.length === 0) {
        hasMore = false;
        break;
      }

      const filtered = organizations.filter((org) => {
        const numbers = org.relatednumbers;
        if (numbers.length === 0 || numbers.length > 150) return false;

        const countTargetOperators = numbers.filter((n) =>
          n.operatorname && targetOperators.includes(n.operatorname)
        ).length;

        const percentage = (countTargetOperators / numbers.length) * 100;
        return percentage >= 60;
      });

      allFiltered = [...allFiltered, ...filtered];
      skip += PAGE_SIZE;
    }

    return NextResponse.json(allFiltered);
  } catch (error) {
    console.error("Erro ao filtrar CNPJs:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
