'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'

export type FilterFormData = {
  limit?: number
  startDate?: string
  endDate?: string
  operator?: string
  ddd?: string
  uf?: string
  companySize?: string
  legalNature?: string
  simplesNacional?: 'true' | 'false'
  mei?: 'true' | 'false'
  situation?: string
}

export default function Component_ListPercentOrganization() {
  const { register, handleSubmit } = useForm<FilterFormData>()
  const [loading, setLoading] = useState(false)
  type ResultRow = Record<string, string | number | boolean | null>;
  const [results, setResults] = useState<ResultRow[]>([])

  const onSubmit = async (data: FilterFormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats/relative/listOrganizations/listOrganizationsPercent', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })

      const json = await res.json()
      setResults(json)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow rounded-2xl p-4">
        <div>
          <label className="block mb-1">Quantidade</label>
          <select {...register('limit')} className="w-full border rounded p-2">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Data Inicial</label>
          <input type="date" {...register('startDate')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">Data Final</label>
          <input type="date" {...register('endDate')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">Operadora</label>
          <input type="text" {...register('operator')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">DDD</label>
          <input type="text" {...register('ddd')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">UF</label>
          <input type="text" {...register('uf')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">Porte da Empresa</label>
          <input type="text" {...register('companySize')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">Natureza Jurídica</label>
          <input type="text" {...register('legalNature')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">Simples Nacional</label>
          <select {...register('simplesNacional')} className="w-full border rounded p-2">
            <option value="">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">MEI</label>
          <select {...register('mei')} className="w-full border rounded p-2">
            <option value="">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Situação Cadastral</label>
          <input type="text" {...register('situation')} className="w-full border rounded p-2" />
        </div>

        <div className="md:col-span-3 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Filtrando...' : 'Filtrar'}
          </button>
        </div>
      </form>

      {/* Resultados */}
      <div className="mt-6">
        {results.length > 0 ? (
          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-4 py-2 border text-left text-sm font-medium text-gray-700">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.values(row).map((value, index) => (
                      <td key={index} className="px-4 py-2 text-sm text-gray-800">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-white mt-4">Nenhum resultado encontrado.</p>
        )}
      </div>
    </div>
  )
}
