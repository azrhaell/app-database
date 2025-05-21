'use client';

import Link from 'next/link';
import {  useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as XLSX from 'xlsx';

interface FormInputs {
  percentage: number;
  minLines: number;
  maxLines: number;
  operator: string;
  startDate?: string;
  endDate?: string;
  operatorname?: string[];
  ddd?: string[];
  state?: string[];
  rfstatus?: string;
  legalnature?: string[];
  companysize?: string[];
  optionalsize?: string;
  optionmei?: string;
}

interface OrganizationDetails {
  cnpj: string;
  companyname: string;
  operatorname: string;
  startofcontract: string;
  mobilephone1: string;
  city: string;
  state: string;

  rfstatus: boolean; //SITUACAO_CADASTRAL
  legalnature: string; //NATUREZA_JURIDICA
  companysize: string; //PORTE_EMPRESA
  optionalsize: boolean; //OPCAO_SIMPLES
  optionmei: boolean; //OPCAO_MEI

  updatedat: string;
  occurrences: number;
}

export default function Component_ListPercentOrganization() {
  const { register, handleSubmit } = useForm<FormInputs>();
  const [results, setResults] = useState<OrganizationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [legalnatures, setLegalnatures] = useState<string[]>([]);
  const [listoperators, setListOperators] = useState<string[]>([]);
  const [liststates, setListStates] = useState<string[]>([]);
  const [listcompanysizes, setListCompanySizes] = useState<string[]>([]);
  const [listddds, setListDDDs] = useState<string[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const fetchData = async () => {
    //CARREGA LEGAL NATURES
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

    //CARREGA OPERATORS
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

    //CARREGA STATES
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

    //CARREGA PORTE EMPRESA
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
      // Atualizar a lista de naturezas jurídicas após a atualização
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar os campos do formulário:', error);
    }
  };
  
  const API_URL = '/api/stats/relative/listOrganizations/listOrganizationsPercent';

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsLoading(true);

    // Simplificar o tratamento de datas
    const formattedData = {
      ...formData,
    };

    console.log("Dados enviados:", formattedData);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const data: OrganizationDetails[] = await response.json();
      setResults(shuffleArray(data));
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar data no formato "dd/mm/aaaa"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para contar ocorrências de CNPJ
  const countOccurrences = (data: OrganizationDetails[]) => {
    const occurrencesMap: Record<string, number> = {};
    
    data.forEach(org => {
      occurrencesMap[org.cnpj] = (occurrencesMap[org.cnpj] || 0) + 1;
    });
  
    return occurrencesMap;
  };

  // Função para exportar CSV
  const exportCSV = () => {
    const occurrencesMap = countOccurrences(results);
    
    const csvContent = [
      ['CNPJ', 'DSNOMERAZAO', 'OPERADORA', 'FIDELIDADE', 'LINHA', 'CIDADE', 'UF', 'SITUAÇÃO CADASTRAL', 'NATUREZA JURIDICA', 'PORTE EMPRESA', 'OPCAO SIMPLES', 'OPCAO MEI', 'ATUALIZADO EM', 'N_LINHAS'], // Cabeçalho
      ...results.map(org => [
        org.cnpj,
        org.companyname,
        org.operatorname,
        formatDate(org.startofcontract),
        org.mobilephone1,
        org.city,
        org.state,
        org.rfstatus,
        org.legalnature,
        org.companysize,
        org.optionalsize,
        org.optionmei,
        formatDate(org.updatedat),
        occurrencesMap[org.cnpj]
      ]),
    ]
      .map(row => row.join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organizations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Função para exportar XLSX
  const exportXLSX = () => {
    const occurrencesMap = countOccurrences(results);

    const worksheet = XLSX.utils.json_to_sheet(results.map(org => ({
      cnpj: org.cnpj,
      companyname: org.companyname,
      operatorname: org.operatorname,
      startofcontract: formatDate(org.startofcontract),
      mobilephone1: org.mobilephone1,
      city: org.city,
      state: org.state,
      rfstatus: org.rfstatus,
      legalnature: org.legalnature,
      companysize: org.companysize,
      optionalsize: org.optionalsize,
      optionmei: org.optionmei,
      updatedat: formatDate(org.updatedat),
      occurrences: occurrencesMap[org.cnpj]
    })), {
      header: ['cnpj', 'companyname', 'operatorname', 'startofcontract', 'mobilephone1', 'city', 'state', 'rfstatus', 'legalnature', 'companysize', 'optionalsize', 'optionmei', 'updatedat', 'occurrences'],
    });

    // Renomeando as colunas para os títulos desejados
    const headerMap: Record<string, string> = {
      cnpj: 'CNPJ',
      companyname: 'DSNOMERAZAO',
      operatorname: 'OPERADORA',
      startofcontract: 'FIDELIDADE',
      mobilephone1: 'LINHA',
      city: 'CIDADE',
      state: 'UF',
      rfstatus: 'SITUAÇÃO CADASTRAL',
      legalnature: 'NATUREZA JURIDICA',
      companysize: 'PORTE EMPRESA',
      optionalsize: 'OPCAO SIMPLES',
      optionmei: 'OPCAO MEI',
      updatedat: 'ATUALIZADO EM',
      occurrences: 'OCORRÊNCIAS'
    };

    Object.keys(headerMap).forEach((key, index) => {
      worksheet[XLSX.utils.encode_col(index) + '1'].v = headerMap[key];
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations');
    XLSX.writeFile(workbook, 'organizations.xlsx');
  };

  // Função para embaralhar o array
  const shuffleArray = (array: OrganizationDetails[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <div className='flex flex-col gap-4'>
      <h2 className="text-xl font-bold mb-4 text-blue-700">Buscar CNPJs por Percentual de Operadora</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className=''>

          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
            <div>
              <label className="block text-sm font-medium text-gray-700">Porcentagem mínima (%)</label>
              <input type="number" {...register('percentage', { required: false, valueAsNumber: true, min: 1, max: 100 })} placeholder="Porcentagem (1-100)" className="border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade mínima de linhas</label>
              <input type="number" {...register('minLines', { required: false, valueAsNumber: true, min: 1 })} placeholder='1' className="border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade máxima de linhas</label>
              <input type="number" {...register('maxLines', { required: false, valueAsNumber: true, min: 1 })} placeholder='100' className="border p-2 rounded" />
            </div>
          </div>

          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de início</label>
              <input type="date" {...register('startDate')} className="border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de fim</label>
              <input type="date" {...register('endDate')} className="border p-2 rounded" />
            </div>
          </div>
          
          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
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
          </div>

          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <span>
                  Porte da Empresa
                </span>
                <Link href={"/statistics/relative/listorganization/listpercentorganization"}>
                  <span> U </span>
                </Link>
              </label>
              <select multiple {...register('companysize')} className="border p-2 rounded h-32" defaultValue={[""]}>
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
              <select multiple {...register('legalnature')} className="border p-2 rounded h-32" defaultValue={[""]}>
                <option value="">Qualquer natureza</option>
                {legalnatures.map(nature => <option key={nature} value={nature}>{nature}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" defaultValue="">Opção Simples</label>
              <select {...register('optionalsize')} className="border p-2 rounded" >
                <option value="">Qualquer opção</option>
                <option value="SIM">Sim</option>
                <option value="NÃO">Não</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" defaultValue="">Opção MEI</label>
              <select {...register('optionmei')} className="border p-2 rounded" >
                <option value="">Qualquer opção</option>
                <option value="SIM">Sim</option>
                <option value="NÃO">Não</option>
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

          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Pesquisar
          </button>
        </div>
      </form>

      {isFetchingData ? (
        <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
          Atualizando Formulário ...
        </button>
        ) : (
        <button onClick={updateDataForm} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
          Atualizar Formulário
        </button>
        )
      }

      {isLoading ? (
        <p className="text-blue-500 font-semibold">Carregando resultados...</p>
      ) : (
        <>
          <h2>Resultados: {results.length}</h2>
          {results.length > 0 && (
            <>
              <div className="flex gap-4">
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                  Exportar para CSV
                </button>
                <button onClick={exportXLSX} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                  Exportar para XLSX
                </button>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200 mt-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.slice(0, 15).map(org => (
                    <tr key={org.cnpj}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/statistics/relative/listoperators/listPhonesByCNPJ/${org.cnpj}`} className="text-blue-500 hover:underline">
                          {org.cnpj}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{org.companyname}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}