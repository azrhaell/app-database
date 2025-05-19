// app/api/search/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { cnpj, name, phone, page = 1 } = await req.json();
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    // Inicializa como array tipado corretamente
    const filters: Prisma.organizationsWhereInput = {
      AND: [] as Prisma.organizationsWhereInput[],
    };

    if (cnpj) {
      (filters.AND as Prisma.organizationsWhereInput[]).push({
        cnpj: {
          contains: cnpj,
        },
      });
    }

    if (name) {
      (filters.AND as Prisma.organizationsWhereInput[]).push({
        OR: [
          {
            companyname: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            businessname: {
              contains: name,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (phone) {
      (filters.AND as Prisma.organizationsWhereInput[]).push({
        relatednumbers: {
          some: {
            OR: [
              {
                mobilephone1: {
                  contains: phone,
                },
              },
              {
                mobilephone2: {
                  contains: phone,
                },
              },
            ],
          },
        },
      });
    }

    const [data, total] = await Promise.all([
    prisma.organizations.findMany({
        where: filters,
        skip,
        take: pageSize,
        select: {
        idCompany: true,
        cnpj: true,
        companyname: true,
        legalnature: true,
        companysize: true,
        optionalsize: true,
        optionmei: true,
        relatednumbers: {
            select: {
            mobilephone1: true,
            },
        },
        },
    }),
    prisma.organizations.count({
        where: filters,
    }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
