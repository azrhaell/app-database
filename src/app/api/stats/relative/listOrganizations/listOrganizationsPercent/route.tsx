import prisma from '@/app/api/database/dbclient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      limit,
      startDate,
      endDate,
      operatorname,
      ddd,
      state,
      companySize,
      legalNature,
      optionalsize,
      optionmei,
      rfstatus,
      numberlines,
      percoperator
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

    if (state && state.length > 0 && !state.includes("")) {
      filters.state = { in: state };
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

    if ((operatorname && operatorname.length > 0 && !operatorname.includes("")) ||
        (ddd && ddd.length > 0 && !ddd.includes("")) ||
        startDate || endDate) {
      const relatedFilter: RelatedNumbersFilter = {};

      if (operatorname && operatorname.length > 0 && !operatorname.includes("")) {
        relatedFilter.operatorname = { in: operatorname };
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

    console.log('Filters:', filters);

    const result = await prisma.organizations.findMany({
      where: filters,
      take: limit ? parseInt(limit) : 1000000,
      include: {
        relatednumbers: {
          select: {
            idNumber: true,
            mobilephone1: true,
            mobilephone2: true,
            operatorname: true,
            previousoperator: true,
            startofcontract: true,
            createdat: true,
            updatedat: true,
            disabled: true,
            pendant: true,
            ported: true,
          },
        },
        _count: {
          select: {
            relatednumbers: true,
          },
        },
      },
    });

    // Filtro por quantidade máxima de telefones
    const filteredResult = result.filter(
      (org) => (org._count?.relatednumbers ?? 0) <= (numberlines ? parseInt(numberlines) : 1000000)
    );

    const mappedResult = filteredResult.map((org) => {
      const operatorCount: Record<string, number> = {};

      org.relatednumbers.forEach((num) => {
        const op = num.operatorname || 'Desconhecido';
        operatorCount[op] = (operatorCount[op] || 0) + 1;
      });

      const mostFrequentOperator = Object.entries(operatorCount).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ['', 0]
      )[0];

      return {
        ...org,
        relatednumberscount: org._count?.relatednumbers ?? 0,
        mostfrequentoperator: mostFrequentOperator,
        relatednumbers: org.relatednumbers,
      };
    });

    // Filtro por percentual de Base (Operadora)
    const filteredByPercent =
      percoperator && operatorname && operatorname.length > 0
      ? mappedResult.filter((org) => {
          const total = org.relatednumberscount;

          // Soma as linhas que pertencem a qualquer uma das operadoras selecionadas
          const countTarget = org.relatednumbers.filter((num) =>
            operatorname.includes(num.operatorname)
          ).length;

          const percentage = (countTarget / total) * 100;
          return percentage >= parseFloat(percoperator);
        })
      : mappedResult;

    return NextResponse.json(filteredByPercent);

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
