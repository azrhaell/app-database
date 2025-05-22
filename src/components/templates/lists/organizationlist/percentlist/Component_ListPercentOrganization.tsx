'use client'

import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export type FilterFormData = {
  limit?: number
  startDate?: string
  endDate?: string
  operatorname?: string
  ddd?: string
  state?: string
  companySize?: string
  legalNature?: string
  optionalsize?: 'true' | 'false'
  optionmei?: 'true' | 'false'
  rfstatus?: string
}

export default function Component_ListPercentOrganization() {
  const { register, handleSubmit } = useForm<FilterFormData>()
  const [loading, setLoading] = useState(false)
  type ResultRow = Record<string, string | number | boolean | null>;
  const [results, setResults] = useState<ResultRow[]>([])
  const [legalnatures, setLegalnatures] = useState<string[]>([]);
  const [listoperators, setListOperators] = useState<string[]>([]);
  const [liststates, setListStates] = useState<string[]>([]);
  const [listcompanysizes, setListCompanySizes] = useState<string[]>([]);
  const [listddds, setListDDDs] = useState<string[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

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

    const fetchData = async () => {
      //CARREGA LEGAL NATURES (NATUREZA JURIDICA)
      try {
        const response = await fetch('/api/database/getbdlegalnature');

        if (!response.ok) {
          throw new Error('Erro ao buscar naturezas jurídicas');
        }

        const data = await response.json();
        setLegalnatures(data);

      } catch (error) {
        console.error('Erro ao buscar naturezas jurídicas:', error);
      } finally {
        setIsFetchingData(false);
      }

      //CARREGA OPERATORS (OPERADORA)
      try {
        const response = await fetch('/api/database/getbdoperator');

        if (!response.ok) {
          throw new Error('Erro ao buscar operadoras');
        }

        const data = await response.json();
        setListOperators(data);//

      } catch (error) {
        console.error('Erro ao buscar operadoras:', error);
      } finally {
        setIsFetchingData(false);
      }

      //CARREGA STATES (UF)
      try {
        const response = await fetch('/api/database/getbdstate');

        if (!response.ok) {
          throw new Error('Erro ao buscar UFs');
        }

        const data = await response.json();
        setListStates(data);//

      } catch (error) {
        console.error('Erro ao buscar UFs:', error);
      } finally {
        setIsFetchingData(false);
      }

      //CARREGA COMPANY SIZE (PORTE EMPRESA) 
      try {
        const response = await fetch('/api/database/getbdcompanysize');

        if (!response.ok) {
          throw new Error('Erro ao buscar Porte da Empresa');
        }

        const data = await response.json();
        setListCompanySizes(data);//

      } catch (error) {
        console.error('Erro ao buscar Porte da Empresa:', error);
      } finally {
        setIsFetchingData(false);
      }

      //CARREGA DDD
      try {
        const response = await fetch('/api/database/getbdmobilephone1');

        if (!response.ok) {
          throw new Error('Erro ao buscar DDD');
        }

        const data = await response.json();
        setListDDDs(data);//

      } catch (error) {
        console.error('Erro ao buscar DDD:', error);
      } finally {
        setIsFetchingData(false);
      }      

    };

    useEffect(() => {
      fetchData();
    }, []);

    // Função para atualizar os campos do formulário
    // (Exemplo: Natureza Jurídica, Operadora, etc.)
    const updateDataForm = async () => {
      setIsFetchingData(true)
      try {
        const response = await fetch('/api/database/updatedataform', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Erro ao atualizar os campos do formulário');
        }
        const data = await response.json();
        console.log(data.message);
        fetchData();
      } catch (error) {
        console.error('Erro ao atualizar os campos do formulário:', error);
      }
    };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow rounded-2xl p-4">
        <div>
          <label className="block mb-1">Quantidade</label>
          <select {...register('limit')} className="w-full border rounded p-2">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="100">150</option>
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
          <label className="block text-sm font-medium text-gray-700">Operadoras</label>
          <select multiple {...register('operatorname')} className="border p-2 rounded h-32" defaultValue={[""]}>
            <option value="">Todas</option>
            {[...new Set(listoperators)].map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <span>DDDs</span>
            <Link href={"/statistics/relative/listorganization/listpercentorganization"}>
              <span> U </span>
            </Link>
          </label>
          <select multiple {...register('ddd')} className="border p-2 rounded h-32" defaultValue={[""]}>
            <option value="">Todos</option>
            {listddds.map(ddd => <option key={ddd} value={ddd}>{ddd}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <span>
              Estados
            </span>
            <Link href={"/statistics/relative/listorganization/listpercentorganization"}>
              <span> U </span>
            </Link>
          </label>
          <select multiple {...register('state')} className="border p-2 rounded h-32" defaultValue={[""]}>
            <option value="">Todos</option>
            {liststates.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <span>
              Porte da Empresa
            </span>
            <Link href={"/statistics/relative/listorganization/listpercentorganization"}>
              <span> U </span>
            </Link>
          </label>
          <select multiple {...register('companySize')} className="border p-2 rounded h-32" defaultValue={[""]}>
            <option value="" >Qualquer porte</option>
            {listcompanysizes.map(company => <option key={company} value={company}>{company}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <span>Natureza Jurídica</span>
            <Link href={"/statistics/relative/listorganization/listpercentorganization"}>
              <span> U </span>
            </Link>
          </label>
          <select multiple {...register('legalNature')} className="border p-2 rounded h-32" defaultValue={[""]}>
            <option value="">Qualquer natureza</option>
            {legalnatures.map(nature => <option key={nature} value={nature}>{nature}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1">Simples Nacional</label>
          <select {...register('optionalsize')} className="w-full border rounded p-2">
            <option value="">Qualquer opção</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">MEI</label>
          <select {...register('optionmei')} className="w-full border rounded p-2">
            <option value="">Qualquer opção</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" defaultValue="">Situação Cadastral</label>
          <select {...register('rfstatus')} className="border p-2 rounded" >
            <option value="">Ativa/Inativa</option>
            <option value="ATIVA">Ativa</option>
            <option value="INATIVA">Inativa</option>
          </select>
        </div>

        <div className="md:col-span-3 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Pesquisando...' : 'Pesquisar'}
          </button>
        </div>
      </form>

      {isFetchingData ? (
        <button className=" bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
          Atualizando Formulário ...
        </button>
        ) : (
        <button onClick={updateDataForm} className=" bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
          Atualizar Formulário
        </button>
        )
      }

      {/* Resultados */}
      <div className="mt-6">
        {results.length > 0 ? (
          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">CNPJ</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">Nome</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">UF</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">Porte Empresa</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">Natureza Jurídica</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">Simples</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">MEI</th>
                  <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">Ativa</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">{row.cnpj || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.companyname || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.state || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.companysize || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.legalnature || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.optionalsize ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.optionmei ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.rfstatus ? 'Sim' : 'Não'}</td>
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
