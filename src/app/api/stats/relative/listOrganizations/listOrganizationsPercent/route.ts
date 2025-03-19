import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/api/database/dbclient";

interface RequestBody {
  percentage: number;
  minLines?: number;
  maxLines?: number;
  startDate?: string;
  endDate?: string;
  operatorname?: string[];
  ddd?: string[];
  companySize?: string[];
  legalNature?: string[];
  mei: string;
  simple: string;
  rfstatus?: string;
  state?: string[];
}

let percentageValue = 1;
let minLinesValue = 1;
let maxLinesValue = 100000;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      percentage = 1,
      minLines = 1,
      maxLines = 100,
      startDate,
      endDate,
      operatorname,
      ddd,
      companySize,
      legalNature,
      mei,
      simple,
      rfstatus,
      state
    } = body;

    console.log("Dados recebidos:", body);

    if (typeof percentage !== "number" || isNaN(percentage) || percentage < 1 || percentage > 100) {
      percentageValue = 1;
    } else {
      percentageValue = percentage;
    }

    if (typeof minLines !== "number" || isNaN(minLines) || minLines < 1) {
      minLinesValue = 1;
    } else {
      minLinesValue = minLines;
    }

    if (typeof maxLines !== "number" || isNaN(maxLines) || maxLines < 1) {
      maxLinesValue = 100000;
    } else {
      maxLinesValue = maxLines;
    }

    const whereClause: any = {};
    const whereClauseFinal: any = {};

    if (startDate || endDate) {
      whereClause.startofcontract = {};
      whereClauseFinal.startofcontract = {};

      if (startDate) {
        try {
          const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
          console.log(`Data de início formatada: ${startDateObj.toISOString()}`);
          whereClause.startofcontract.gte = startDateObj;
          whereClauseFinal.startofcontract.gte = whereClause.startofcontract.gte;
        } catch (error: any) {
          console.error("Erro ao formatar data de início:", error);
          return NextResponse.json({ message: "Data de início inválida", error: error.message }, { status: 400 });
        }
      }

      if (endDate) {
        try {
          const endDateObj = new Date(`${endDate}T23:59:59.999Z`);
          console.log(`Data de fim formatada: ${endDateObj.toISOString()}`);
          whereClause.startofcontract.lte = endDateObj;
          whereClauseFinal.startofcontract.lte = whereClause.startofcontract.lte;
        } catch (error: any) {
          console.error("Erro ao formatar data de fim:", error);
          return NextResponse.json({ message: "Data de fim inválida", error: error.message }, { status: 400 });
        }
      }
    }

    // Filtro de DDD
    if (Array.isArray(ddd) && ddd.length > 0 && !(ddd.length === 1 && ddd[0] === '')) {
      whereClause.OR = ddd
        .filter(d => typeof d === "string" && d.trim() !== "")
        .map(d => ({
          mobilephone1: {
            startsWith: d
          }
        }));
    }
    
    /*if (companySize && companySize.length > 0) {
      if (!(companySize[0] == '' && companySize.length == 1)) {
        whereClause.companysize = { in: companySize };
      }
    }*/

    if (Array.isArray(companySize) && companySize.length > 0 && !(companySize.length === 1 && companySize[0] === '')) {
      whereClause.companySize = { in: companySize.filter(s => typeof s === "string" && s.trim() !== "") };
    }

    /*if (legalNature && legalNature.length > 0) {
      if (!(legalNature[0] == '' && legalNature.length == 1)) {
        whereClause.legalnature = { in: legalNature };
      }
    }*/

    if (Array.isArray(legalNature) && legalNature.length > 0 && !(legalNature.length === 1 && legalNature[0] === '')) {
      whereClause.legalNature = { in: legalNature.filter(s => typeof s === "string" && s.trim() !== "") };
    }

    if (mei === "SIM") {
      whereClause.optionmei = true;
    } else {
      delete whereClause.optionmei;
    }

    if (simple == 'SIM') {
      whereClause.optionalsize = true;
    } else {
      delete whereClause.optionalsize
    }

    if (rfstatus == 'ATIVA') {
      whereClause.rfstatus = rfstatus;
    } else {
      delete whereClause.rfstatus;
    }

    if (Array.isArray(state) && state.length > 0 && !(state.length === 1 && state[0] === '')) {
      whereClause.state = { in: state.filter(s => typeof s === "string" && s.trim() !== "") };
    }
  
    // Remove chaves vazias antes de enviar para o Prisma
    Object.keys(whereClause).forEach(key => {
      if (
        whereClause[key] === undefined ||
        whereClause[key] === null ||
        (Array.isArray(whereClause[key]) && whereClause[key].length === 0)
      ) {
        delete whereClause[key];
      }
    });

    // Verifica se o whereClause está vazio antes da consulta
    const prismaQuery = Object.keys(whereClause).length > 0 ? { where: whereClause } : {};

    console.log("WhereClause final antes da consulta:", JSON.stringify(prismaQuery, null, 2));
    console.log("Dados considerados na Primeira Consulta: ", whereClause);

    if (Object.keys(whereClause).length === 0) {
      whereClause.startofcontract = {
        gte: new Date("2001-01-01T00:00:00.000Z"),
        lte: new Date("2025-12-31T23:59:59.999Z"),
      };
    }
    
    const allOrganizations = await prisma.organizations.findMany({
      where: whereClause,
      select: {
        idCompany: true,
        cnpj: true,
        companyname: true,
        operatorname: true,
        mobilephone1: true,
        startofcontract: true,
        legalnature: true,
        companysize: true,
        optionalsize: true,
        optionmei: true,
        rfstatus: true,
        city: true,
        state: true,
        updatedat: true,
      },
    });

    console.log("PRIMEIRA CONSULTA FEITA ...");

    if (!allOrganizations.length) {
      return NextResponse.json({ message: "Nenhum dado encontrado" }, { status: 404 });
    }

    let resultCnpj = [];
    const allCnpjCount: Record<string, number> = {};
    const operatorCnpjCount: Record<string, number> = {};
    const nooperatorCnpjCount: Record<string, number> = {};

    console.log("VERIFICAR OPERATORNAME ...");
    if ((operatorname && operatorname.length > 0) && (!(operatorname[0] == '' && operatorname.length == 1))) {
      console.log("OPERATORNAME VÁLIDO");
      for (const org of allOrganizations) {
        if (!org.cnpj) {
          console.log(`CNPJ INVÁLIDO: ${org.cnpj}`);
          continue;
        } else {
          allCnpjCount[org.cnpj] = (allCnpjCount[org.cnpj] || 0) + 1;

          if (!(org.operatorname == null || org.operatorname == undefined)) {
            org.operatorname = org.operatorname.toString();
          } else {
            org.operatorname = "";
          }

          if (operatorname?.includes(org.operatorname)) {
            operatorCnpjCount[org.cnpj] = (operatorCnpjCount[org.cnpj] || 0) + 1;
          }
        }
      }

      resultCnpj = Object.keys(operatorCnpjCount).filter(cnpj =>
        (cnpj && (((operatorCnpjCount[cnpj] / allCnpjCount[cnpj]) * 100) >= percentageValue) && (allCnpjCount[cnpj] >= minLinesValue) && (allCnpjCount[cnpj] <= maxLinesValue))
      );

    } else {
      console.log("OPERATORNAME VAZIO");

      // Contar o número de registros para cada CNPJ
      for (const org of allOrganizations) {
        if (!org.cnpj) {
          console.log(`CNPJ INVÁLIDO: ${org.cnpj}`);
          continue;
        } else {
          nooperatorCnpjCount[org.cnpj] = (nooperatorCnpjCount[org.cnpj] || 0) + 1;
        }
      }

      resultCnpj = Object.keys(nooperatorCnpjCount).filter(cnpj => {
        const numLines = nooperatorCnpjCount[cnpj];
        return numLines >= minLinesValue && numLines <= maxLinesValue;
      });
    }

    if (!resultCnpj.length) {
      return NextResponse.json({ message: "Nenhum CNPJ atende aos critérios definidos" }, { status: 404 });
    }

    console.log("Dados considerados na Segunda Consulta: ", whereClauseFinal);
    const batchSize = 5000;
    const resultDetails = [];

    for (let i = 0; i < resultCnpj.length; i += batchSize) {
      const batchCnpj = resultCnpj.slice(i, i + batchSize);
      //whereClauseFinal.cnpj = { in: batchCnpj };

      const whereBatch = { ...whereClauseFinal, cnpj: { in: batchCnpj } }; //////

      const batchResult = await prisma.organizations.findMany({
        //where: whereClauseFinal,
        where: whereBatch,
        select: {
          cnpj: true,
          companyname: true,
          operatorname: true,
          mobilephone1: true,
          startofcontract: true,
          legalnature: true,
          companysize: true,
          optionalsize: true,
          optionmei: true,
          rfstatus: true,
          city: true,
          state: true,
          updatedat: true,
        },
      });

      resultDetails.push(...batchResult);
      //resultDetails.concat(...batchResult);
    }

    console.log("ÚLTIMA CONSULTA FEITA ...");

    return NextResponse.json(resultDetails, { status: 200 });
  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      message: "Erro interno do servidor",
      error: error?.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}