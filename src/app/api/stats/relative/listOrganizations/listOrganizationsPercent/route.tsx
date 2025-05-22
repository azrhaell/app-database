import prisma from "@/app/api/database/dbclient";
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const {
    limit,
    startDate,
    endDate,
    operator,
    ddd,
    uf,
    companySize,
    legalNature,
    simplesNacional,
    mei,
    situation
  } = await req.json();

  const take = Number(limit) || 50;

  const where: Prisma.organizationsWhereInput = {
    ...(uf && { state: uf }),
    ...(companySize && { companysize: companySize }),
    ...(legalNature && { legalnature: legalNature }),
    ...(simplesNacional !== undefined && simplesNacional !== '' && {
      optionalsize: simplesNacional === 'true'
    }),
    ...(mei !== undefined && mei !== '' && {
      optionmei: mei === 'true'
    }),
    ...(situation && { status: { contains: situation, mode: 'insensitive' } }),
    ...(startDate || endDate ? {
      relatednumbers: {
        some: {
          ...(startDate && { startofcontract: { gte: new Date(startDate) } }),
          ...(endDate && { startofcontract: { lte: new Date(endDate) } }),
          ...(operator && { operatorname: { contains: operator, mode: 'insensitive' } }),
          ...(ddd && { mobilephone1: { startsWith: ddd } }) // Supondo que DDD esteja no início do número
        }
      }
    } : operator || ddd ? {
      relatednumbers: {
        some: {
          ...(operator && { operatorname: { contains: operator, mode: 'insensitive' } }),
          ...(ddd && { mobilephone1: { startsWith: ddd } })
        }
      }
    } : undefined)
  };

  const organizations = await prisma.organizations.findMany({
    where,
    take,
    include: {
      relatednumbers: {
        select: {
          mobilephone1: true,
          operatorname: true,
          startofcontract: true,
        }
      }
    }
  });

  return NextResponse.json(organizations);
}
