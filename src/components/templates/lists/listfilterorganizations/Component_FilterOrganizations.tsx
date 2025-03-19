'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const filterSchema = z
  .object({
    cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos').optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    state: z.array(z.string()).optional(),
    operatorname: z.array(z.string()).optional(),
    ddd: z.array(z.string()).optional(), // Alterado para array
    status: z.enum(['ATIVA', 'NÃO ATIVA']).optional().or(z.literal('')),
  })
  .refine((data) => Object.values(data).some((value) => value !== '' && value !== undefined), {
    message: 'Pelo menos um campo deve ser preenchido.',
  });

interface Organization {
  cnpj: string;
  operatorname: string;
  startofcontract: string;
  city: string;
  state: string;
  status: string;
}

export default function FilterOrganizations() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(filterSchema),
  });
  const [data, setData] = useState<{ totalCNPJs: number; totalPhones: number; records: Organization[] }>({
    totalCNPJs: 0,
    totalPhones: 0,
    records: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ddds, setDdds] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stats/relative/listOrganizations/getDDDs');
        const result = await response.json();
        setDdds(result.ddds);
      } catch (err) {
        console.error('Erro ao buscar DDDs', err);
      }
    }
    
    async function fetchStates() {
      try {
        const response = await fetch('/api/stats/relative/listOrganizations/getStates');
        const result = await response.json();
        setStates(result.states);
      } catch (err) {
        console.error('Erro ao buscar UFs', err);
      }
    }
    
    async function fetchOperators() {
      try {
        const response = await fetch('/api/stats/relative/listOrganizations/getOperators');
        const result = await response.json();
        setOperators(result.operators);
      } catch (err) {
        console.error('Erro ao buscar Operadoras', err);
      }
    }

    fetchData();
    fetchStates();
    fetchOperators();
  }, []);

  const onSubmit = async (values: z.infer<typeof filterSchema>) => {
    setLoading(true);
    setError(null);
    setData({ totalCNPJs: 0, totalPhones: 0, records: [] });

    try {
      const queryParams = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(',')); // Enviar arrays como string separada por vírgula
        } else if (value) {
          queryParams.append(key, value as string);
        }
      });
      
      const response = await fetch(`/api/stats/relative/listOrganizations/listOrganizationsFilter?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Filtrar Organizações</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 grid grid-cols-2 gap-4">
        <input {...register('cnpj')} placeholder="CNPJ" className="border p-2 rounded" />
        <input {...register('startDate')} placeholder="Data Inicial (dd/mm/aaaa)" className="border p-2 rounded" />
        <input {...register('endDate')} placeholder="Data Final (dd/mm/aaaa)" className="border p-2 rounded" />
        
        <select multiple {...register('operatorname')} className="border p-2 rounded h-32">
          <option value="">Qualquer Operadora</option>
          {operators.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        
        <select multiple {...register('ddd')} className="border p-2 rounded h-32">
          
          {ddds.map((ddd) => (
            <option key={ddd} value={ddd}>{ddd}</option>
          ))}
        </select>

        <select {...register('status')} className="border p-2 rounded">
          <option value="">Status</option>
          <option value="ATIVA">ATIVA</option>
          <option value="NÃO ATIVA">NÃO ATIVA</option>
        </select>
        
        <select multiple {...register('state')} className="border p-2 rounded h-32">
          <option value="">Qualquer estado</option>
          {states.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Buscar</button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      <div className="bg-gray-100 shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">Resultados</h2>
        <p><strong>Quantidade de CNPJs:</strong> {data.totalCNPJs}</p>
        <p><strong>Total de Linhas:</strong> {data.totalPhones}</p>
        <ul>
          {data.records.slice(0, 15).map(({ cnpj, operatorname, startofcontract, city, state, status }, index) => (
            <li key={index}>
              {cnpj} - {operatorname} - {startofcontract} - {city}/{state} - {status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
