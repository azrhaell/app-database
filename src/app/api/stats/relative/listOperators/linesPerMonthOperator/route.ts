import { NextResponse } from "next/server";
import prisma from "@/app/api/database/dbclient";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 36);

    const filteredData = await prisma.$queryRaw<
      { month: string; operatorname: string; total_lines: bigint }[]
    >(
      Prisma.sql`
      SELECT 
        TO_CHAR(startofcontract, 'YYYY-MM') AS month,
        operatorname,
        COUNT(*) AS total_lines
      FROM organizations
      WHERE startofcontract >= ${Prisma.raw(`'${oneYearAgo.toISOString()}'`)}
      GROUP BY month, operatorname
      ORDER BY month ASC, operatorname ASC
      `
    );

    // 🔹 Convertendo BigInt para Number antes de enviar a resposta
    const formattedData = filteredData.map((row) => ({
      month: row.month,
      operatorname: row.operatorname,
      total_lines: Number(row.total_lines),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("❌ Erro na API:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}