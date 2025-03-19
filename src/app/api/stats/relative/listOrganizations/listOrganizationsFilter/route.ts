import { NextResponse } from 'next/server';
import prisma from '@/app/api/database/dbclient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);

    // Função para converter "dd/mm/aaaa", "dd-mm-aaaa" ou "ddmmaaaa" -> Date
    const convertToISODate = (date?: string) => {
      if (!date) return undefined;

      let day, month, year;

      // Verifica se o formato contém "/" ou "-"
      if (date.includes('/') || date.includes('-')) {
        [day, month, year] = date.split(/[/\-]/); // Divide por "/" ou "-"
      } else if (date.length === 8) {
        // Se for no formato "ddmmaaaa", separa manualmente
        day = date.slice(0, 2);
        month = date.slice(2, 4);
        year = date.slice(4, 8);
      } else {
        return undefined; // Formato inválido
      }

      return new Date(`${year}-${month}-${day}T00:00:00.000Z`); // Retorna um objeto Date
    };

    const where: any = {};

    if (params.cnpj) where.cnpj = params.cnpj;

    // Permite filtrar múltiplas operadoras separadas por vírgula
    if (params.operatorname) {
      const operatorsArray = Array.isArray(params.operatorname)
        ? params.operatorname
        : params.operatorname.split(',');
      where.operatorname = { in: operatorsArray };
    }

    if (params.status) where.status = params.status;

    if (params.ddd) {
      const dddsArray = Array.isArray(params.ddd) ? params.ddd : params.ddd.split(',');
      
      if (dddsArray.length === 1) {
        where.mobilephone1 = { startsWith: dddsArray[0] };
      } else {
        where.OR = dddsArray.map((ddd) => ({
          mobilephone1: { startsWith: ddd },
        }));
      }
    }

    // Permite filtrar múltiplos estados separados por vírgula
    if (params.state) {
      const statesArray = Array.isArray(params.state)
        ? params.state
        : params.state.split(',');
      where.state = { in: statesArray };
    }

    // Tratamento das datas
    if (params.startDate || params.endDate) {
      where.startofcontract = {};
      if (params.startDate) where.startofcontract.gte = convertToISODate(params.startDate);
      if (params.endDate) where.startofcontract.lte = convertToISODate(params.endDate);
    }

    const records = await prisma.organizations.findMany({
      where,
      select: {
        cnpj: true,
        operatorname: true,
        startofcontract: true,
        city: true,
        state: true,
        status: true,
      },
    });

    const totalCNPJs = new Set(records.map((record) => record.cnpj)).size;
    const totalPhones = records.length;

    return NextResponse.json({ totalCNPJs, totalPhones, records });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
