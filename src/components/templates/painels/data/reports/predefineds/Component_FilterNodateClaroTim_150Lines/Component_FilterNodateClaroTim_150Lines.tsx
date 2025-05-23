'use client'

import { useState } from 'react'
import Papa from 'papaparse'

export default function CnpjsPage() {
  interface Organization {
    idCompany: string;
    cnpj: string;
    companyname: string;
    city?: string;
    state?: string;
    rfstatus?: string;
    legalnature?: string;
    companysize?: string;
    optionalsize?: boolean;
    optionmei?: boolean;
    updatedat?: string;
    numberlines?: number;
    relatednumbers: {
      operatorname?: string;
      previousoperator?: string;
      startofcontract?: string;
      mobilephone1?: string;
      ported?: boolean;
    }[];
  }

  const [data, setData] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchFilteredCnpjs() {
    setLoading(true)
    try {
      const res = await fetch('/api/stats/relative/organizations/readyfilternodatecnpj')
      if (!res.ok) throw new Error('Erro ao buscar dados.')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    interface Row {
      CNPJ: string;
      DSNOMERAZAO: string;
      OPERADORA: string;
      PORTOU: string;
      "OPERADORA ANTERIOR": string;
      ATIVAÇÃO: string;
      LINHA: string;
      CIDADE: string;
      UF: string;
      "SITUAÇÃO CADASTRAL": string;
      "NATUREZA JURIDICA": string;
      "PORTE EMPRESA": string;
      "OPCAO SIMPLES": string;
      "OPCAO MEI": string;
      "ATUALIZADO EM": string;
      "QTD. LINHAS": number;
    }

    const rows: Row[] = []

    data.forEach((org: Organization) => {
      org.relatednumbers.forEach((num) => {
        rows.push({
          "CNPJ": org.cnpj,
          "DSNOMERAZAO": org.companyname,
          "OPERADORA": num.operatorname || "",
          "PORTOU": num.ported ? "Sim" : "Não",
          "OPERADORA ANTERIOR": num.previousoperator || "",
          "ATIVAÇÃO": num.startofcontract
            ? new Date(num.startofcontract).toLocaleDateString("pt-BR")
            : "",
          "LINHA": num.mobilephone1 || "",
          "CIDADE": org.city || "",
          "UF": org.state || "",
          "SITUAÇÃO CADASTRAL": org.rfstatus || "",
          "NATUREZA JURIDICA": org.legalnature || "",
          "PORTE EMPRESA": org.companysize || "",
          "OPCAO SIMPLES": org.optionalsize ? "Sim" : "Não",
          "OPCAO MEI": org.optionmei ? "Sim" : "Não",
          "ATUALIZADO EM": org.updatedat
            ? new Date(org.updatedat).toLocaleDateString("pt-BR")
            : "",
          "QTD. LINHAS": org.relatednumbers.length,
        })
      })
    })

    const csv = Papa.unparse(rows, {
      delimiter: ';',
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'cnpjs_filtrados_NODATE.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CNPJs com até 150 linhas e 60% operadoras específicas - SEM DATA</h1>
      <button
        onClick={fetchFilteredCnpjs}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Buscando...' : 'Filtrar CNPJs'}
      </button>

      {data.length > 0 && (
        <>
          <div className="mt-4">
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Exportar para CSV
            </button>
          </div>

          <table className="table-auto w-full mt-6 border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">CNPJ</th>
                <th className="border px-2 py-1">Razão Social</th>
                <th className="border px-2 py-1">Qtd. Linhas</th>
                <th className="border px-2 py-1">Operadora</th>
                <th className="border px-2 py-1">Portou</th>
                <th className="border px-2 py-1">Operadora Anterior</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((org: Organization) => (
                <tr key={org.idCompany}>
                  <td className="border px-2 py-1">{org.cnpj}</td>
                  <td className="border px-2 py-1">{org.companyname}</td>
                  <td className="border px-2 py-1">{org.relatednumbers.length}</td>
                  <td className="border px-2 py-1">{org.relatednumbers[0]?.operatorname || 'N/A'}</td>
                  <td className="border px-2 py-1">{org.relatednumbers[0]?.ported ? 'Sim' : 'Não'}</td>
                  <td className="border px-2 py-1">{org.relatednumbers[0]?.previousoperator || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
