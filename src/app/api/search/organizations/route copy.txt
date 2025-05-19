// app/api/search/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function POST(req: NextRequest) {
  try {
    const { cnpj, name, phone } = await req.json();

    const organizations = await prisma.organizations.findMany({
      where: {
        AND: [
          cnpj ? { cnpj: { contains: cnpj } } : {},
          name
            ? {
                OR: [
                  { companyname: { contains: name, mode: 'insensitive' } },
                  { businessname: { contains: name, mode: 'insensitive' } },
                ],
              }
            : {},
          phone
            ? {
                relatednumbers: {
                  some: {
                    OR: [
                      { mobilephone1: { contains: phone } },
                      { mobilephone2: { contains: phone } },
                    ],
                  },
                },
              }
            : {},
        ],
      },
      include: {
        relatednumbers: true,
      },
      take: 50, // limite de resultados por pagina
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
