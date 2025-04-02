'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip,BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CircleLoading from '@/components/templates/misc/loading/Component_CircleLoading';

interface StateCount {
  state: string;
  count: number;
}

interface OperatorCount {
  operatorname: string;
  count: number;
}

interface CNPJCount {
  cnpj: string;
  count: number;
}

interface OperatorByState {
  state: string;
  operatorname: string;
}

const colorList = [
  '#36A2EB', // Azul
  '#FF9F40', // Laranja
  '#4BC0C0', // Verde
  '#FF6384', // Vermelho
  '#FFCE56', // Amarelo
  '#9966FF', // Roxo
  '#808080', // Cinza
  '#00FFFF', // Ciano
  '#006400', // Verde-Escuro
  '#8B0000', // Vermelho-Escuro
];

export default function Page() {
  const [uniqueCNPJs, setUniqueCNPJs] = useState<number | null>(null);
  const [uniquePhones, setUniquePhones] = useState<number | null>(null);
  const [cnpjsByState, setCnpjsByState] = useState<StateCount[]>([]);
  const [phonesByState, setPhonesByState] = useState<StateCount[]>([]);
  const [phonesByOperator, setPhonesByOperator] = useState<OperatorCount[]>([]);
  const [operatorsByState, setOperatorsByState] = useState<StateCount[]>([]);
  const [maxOperatorByState, setMaxOperatorByState] = useState<OperatorByState[]>([]);
  const [maxPhonesByOperator, setMaxPhonesByOperator] = useState<OperatorCount | null>(null);
  const [maxPhonesByCNPJ, setMaxPhonesByCNPJ] = useState<CNPJCount | null>(null);

  const [loadingCNPJs, setLoadingCNPJs] = useState<boolean>(true);
  const [loadingPhones, setLoadingPhones] = useState<boolean>(true);
  const [loadingCnpjsByState, setLoadingCnpjsByState] = useState<boolean>(true);
  const [loadingPhonesByState, setLoadingPhonesByState] = useState<boolean>(true);
  const [loadingPhonesByOperator, setLoadingPhonesByOperator] = useState<boolean>(true);
  const [loadingOperatorsByState, setLoadingOperatorsByState] = useState<boolean>(true);
  const [loadingMaxOperatorByState, setLoadingMaxOperatorByState] = useState<boolean>(true);
  const [loadingMaxPhonesByOperator, setLoadingMaxPhonesByOperator] = useState<boolean>(true);
  const [loadingMaxPhonesByCNPJ, setLoadingMaxPhonesByCNPJ] = useState<boolean>(true);

  /*useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Erro ao buscar estatísticas');
        const data = await response.json();

        //setUniqueCNPJs(data.uniqueCNPJs || 0);
        //setLoadingCNPJs(false);

        //setUniquePhones(data.uniquePhones || 0);
        //setLoadingPhones(false);

        //setCnpjsByState(data.cnpjsByState || []);
        //setLoadingCnpjsByState(false);

        //setPhonesByState(data.phonesByState || []);
        //setLoadingPhonesByState(false);

        //setPhonesByOperator(data.phonesByOperator || []);
        //setLoadingPhonesByOperator(false);

        //setOperatorsByState(data.operatorsByState || []);
        //setLoadingOperatorsByState(false);

        //setMaxOperatorByState(data.maxOperatorByState || []);
        //setLoadingMaxOperatorByState(false);

        //setMaxPhonesByOperator(data.maxPhonesByOperator || null);
        //setLoadingMaxPhonesByOperator(false);

        //setMaxPhonesByCNPJ(data.maxPhonesByCNPJ || null);
        //setLoadingMaxPhonesByCNPJ(false);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      }
    }
    fetchStats(); //
  }, []);*/

  //COUNT CNPJ
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/generalstatistics/countcnpj');
        if (!response.ok) throw new Error('Erro ao calcular a contagem de CNPJs');
        const data = await response.json();

        setUniqueCNPJs(data.uniqueCNPJs || 0);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoadingCNPJs(false);
      }
    }
    fetchStats();
  }, []);

  //COUNT PHONES
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/generalstatistics/countphones');
        if (!response.ok) throw new Error('Erro ao calcular a contagem de Telefones');
        const data = await response.json();

        setUniquePhones(data.uniquePhones || 0);

      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoadingPhones(false);
      }
    }
    fetchStats();
  }, []);

  //CNPJ BY STATE
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/generalstatistics/cnpjbystate');
        if (!response.ok) throw new Error('Erro ao buscar estatísticas de CNPJs');
        const data = await response.json();

        setCnpjsByState(data.cnpjsByState || 0);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoadingCnpjsByState(false);
      }
    }
    fetchStats();
  }, []);

  //PHONE BY STATE
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/generalstatistics/phonesbystate');
        if (!response.ok) throw new Error('Erro ao buscar estatísticas de Telefones');
        const data = await response.json();

        setPhonesByState(data.phonesByState || 0);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoadingPhonesByState(false);
      }
    }
    fetchStats();
  }, []);

  //PHONE BY OPERATOR
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/generalstatistics/phonesbyoperator');
        if (!response.ok) throw new Error('Erro ao buscar estatísticas de Telefones');
        const data = await response.json();

        setPhonesByOperator(data.phonesByOperator || 0);
        setMaxPhonesByOperator(data.maxPhonesByOperator || null);

      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoadingPhonesByOperator(false);
        setLoadingMaxPhonesByOperator(false);
      }
    }
    fetchStats();
  }, []);

    //PHONE BY CNPJ
    useEffect(() => {
      async function fetchStats() {
        try {
          const response = await fetch('/api/stats/generalstatistics/phonesbycnpj');
          if (!response.ok) throw new Error('Erro ao buscar estatísticas de Telefones por CNPJ');
          const data = await response.json();
  
          setMaxPhonesByCNPJ(data.maxPhonesByCNPJ || null);
  
        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        } finally {
          setLoadingMaxPhonesByCNPJ(false);
        }
      }
      fetchStats();
    }, []);

    //OPERATOR BY STATE
    useEffect(() => {
      async function fetchStats() {
        try {
          const response = await fetch('/api/stats/generalstatistics/operatorbystateraw');
          if (!response.ok) throw new Error('Erro ao buscar estatísticas de Operadoras por estados');
          const data = await response.json();
  
          setOperatorsByState(data.operatorsByState || null);
  
        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        } finally {
          setLoadingOperatorsByState(false);
        }
      }
      fetchStats();
    }, []);

    //MAX OPERATOR BY STATE
    useEffect(() => {
      async function fetchStats() {
        try {
          const response = await fetch('/api/stats/generalstatistics/maxoperatorbystatemap');
          if (!response.ok) throw new Error('Erro ao buscar estatísticas de Operadoras por estados');
          const data = await response.json();
  
          setMaxOperatorByState(data.maxOperatorByState || null);

        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        } finally {
          setLoadingMaxOperatorByState(false);
        }
      }
      fetchStats();
    }, []);

  interface CustomizedLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }

  const renderCustomizedLabel = (props: CustomizedLabelProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className='flex flex-col w-full min-h-screen bg-gray-600 p-4'>
      <h1 className="text-2xl font-bold mb-4 text-center">Estatística Geral</h1>
      <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:w-1/4 bg-gray-400 p-4 rounded-lg">
          <h2 className="text-xl font-bold mt-2">Geral</h2>
          <ul className="bg-white shadow-md rounded-lg p-4">
            <li>
              <strong>Quantidade de CNPJs:</strong> {loadingCNPJs ? <CircleLoading /> : uniqueCNPJs}
            </li>
            <li>
              <strong>Quantidade de Linhas:</strong> {loadingPhones ? <CircleLoading /> : uniquePhones}
            </li>
          </ul>
        </div>

        <div className="flex flex-col md:w-3/4 gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>CNPJs por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCnpjsByState ? (
                    <CircleLoading />
                  ) : cnpjsByState && cnpjsByState.length > 0 ? (
                    <PieChart width={400} height={400} className="mx-auto">
                      <Pie
                        data={cnpjsByState.map(entry => ({ ...entry, state: entry.state || 'n/d' }))}
                        dataKey="count"
                        nameKey="state"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {cnpjsByState.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorList[index % colorList.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <p>Nenhuma informação disponível</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Nº de Linhas por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPhonesByState ? (
                    <CircleLoading />
                  ) : phonesByState && phonesByState.length > 0 ? (
                    <PieChart width={400} height={400} className="mx-auto">
                      <Pie
                        data={phonesByState.map(entry => ({ ...entry, state: entry.state || 'n/d' }))}
                        dataKey="count"
                        nameKey="state"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#82ca9d"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {phonesByState.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorList[index % colorList.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <p>Nenhuma informação disponível</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <Card>
                  <CardHeader>
                    <CardTitle>Nº de Linhas por Operadora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPhonesByOperator ? (
                      <CircleLoading />
                    ) : phonesByOperator && phonesByOperator.length > 0 ? (
                      <BarChart
                        width={500}
                        height={300}
                        data={phonesByOperator.sort((a, b) => b.count - a.count).slice(0, 5)} // Apenas os 5 maiores
                        layout="vertical"
                        className="mx-auto"
                      >
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="operatorname" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" barSize={30}>
                          {phonesByOperator.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorList[index % colorList.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <p>Nenhuma informação disponível</p>
                    )}
                  </CardContent>
                </Card>
            </div>

            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <h2 className="text-xl font-bold mt-2">Operadoras por Estado</h2>
              {loadingOperatorsByState ? (
                <CircleLoading />
              ) : operatorsByState && operatorsByState.length > 0 ? (
                <ul className="bg-white shadow-md rounded-lg p-4">
                  {operatorsByState.map(({ state, count }) => (
                    <li key={`${state || 'n/d'}-b`}>
                      <strong>{state || 'n/d'}:</strong> {count} operadoras
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma informação disponível</p>
              )}
            </div>

            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <h2 className="text-xl font-bold mt-2">Maior Operadora por Estado</h2>
              {loadingMaxOperatorByState ? (
                <CircleLoading />
              ) : maxOperatorByState && maxOperatorByState.length > 0 ? (
                <ul className="bg-white shadow-md rounded-lg p-4">
                  {maxOperatorByState.map(({ state, operatorname }) => (
                    <li key={`${state || 'n/d'}`}>
                      <strong>{state || 'n/d'}:</strong> {operatorname}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma informação disponível</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <h2 className="text-xl font-bold mt-2">Operadora com mais Linhas</h2>
              {loadingMaxPhonesByOperator ? (
                <CircleLoading />
              ) : maxPhonesByOperator ? (
                <p className="bg-white shadow-md rounded-lg p-4">
                  <strong>{maxPhonesByOperator.operatorname}:</strong> {maxPhonesByOperator.count}
                </p>
              ) : (
                <p className="bg-white shadow-md rounded-lg p-4">Nenhuma informação disponível</p>
              )}
            </div>

            <div className="flex-1 bg-gray-400 p-4 rounded-lg">
              <h2 className="text-xl font-bold mt-2">CNPJ com mais Linhas</h2>
              {loadingMaxPhonesByCNPJ ? (
                <CircleLoading />
              ) : maxPhonesByCNPJ ? (
                <p className="bg-white shadow-md rounded-lg p-4">
                  <strong>
                    <Link href={`/statistics/relative/listoperators/listPhonesByCNPJ/${maxPhonesByCNPJ.cnpj}`} className="text-blue-500 hover:underline">
                      {maxPhonesByCNPJ.cnpj}
                    </Link>:
                  </strong> {maxPhonesByCNPJ.count} linhas
                </p>
              ) : (
                <p className="bg-white shadow-md rounded-lg p-4">Nenhuma informação disponível</p>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
