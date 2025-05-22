import prisma from '@/app/api/database/dbclient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      limit,
      startDate,
      endDate,
      operator,
      ddd,
      uf,
      companySize,
      legalNature,
      optionalsize,
      optionmei,
      rfstatus,
    } = await req.json();

    interface RelatedNumbersFilter {
      operatorname?: { in: string[] };
      mobilephone1?: { startsWith?: string; in?: string[] };
      startofcontract?: { gte?: Date; lte?: Date };
    }

    interface OrganizationsFilters {
      state?: { in: string[] };
      legalnature?: { in: string[] };
      companysize?: { in: string[] };
      rfstatus?: string;
      optionalsize?: boolean;
      optionmei?: boolean;
      relatednumbers?: { some: RelatedNumbersFilter };
    }

    const filters: OrganizationsFilters = {};

    if (uf && uf.length > 0 && !uf.includes("")) {
      filters.state = { in: uf };
    }

    if (legalNature && legalNature.length > 0 && !legalNature.includes("")) {
      filters.legalnature = { in: legalNature };
    }

    if (companySize && companySize.length > 0 && !companySize.includes("")) {
      filters.companysize = { in: companySize };
    }

    if (rfstatus && rfstatus !== "") {
      filters.rfstatus = rfstatus;
    }

    if (optionalsize !== undefined && optionalsize !== "") {
      filters.optionalsize = optionalsize === 'true';
    }

    if (optionmei !== undefined && optionmei !== "") {
      filters.optionmei = optionmei === 'true';
    }

    if ((operator && operator.length > 0 && !operator.includes("")) ||
        (ddd && ddd.length > 0 && !ddd.includes("")) ||
        startDate || endDate) {
      const relatedFilter: RelatedNumbersFilter = {};

      if (operator && operator.length > 0 && !operator.includes("")) {
        relatedFilter.operatorname = { in: operator };
      }

      if (ddd && ddd.length > 0 && !ddd.includes("")) {
        const ddds = ddd.map((d: string) => d.padStart(2, '0'));
        relatedFilter.mobilephone1 = {
          in: ddds,
          ...(ddds.length === 1 ? { startsWith: ddds[0] } : {}),
        };
      }

      if (startDate || endDate) {
        relatedFilter.startofcontract = {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        };
      }

      filters.relatednumbers = { some: relatedFilter };
    }

    const result = await prisma.organizations.findMany({
      where: filters,
      take: limit ? parseInt(limit) : 10,
      include: {
        relatednumbers: {
          select: {
            mobilephone1: true,
            operatorname: true,
            startofcontract: true,
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Erro na API listOrganizationsPercent:', error);
    return NextResponse.json(
      {
        error: 'Erro interno no servidor',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
