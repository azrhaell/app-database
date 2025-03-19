'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CircleLoading from '@/components/templates/misc/loading/Component_CircleLoading';

interface Phone {
  companyname: string,
  mobilephone1: string,
  startofcontract: string,
  operatorname: string,
  city: string,
  state: string,
}

interface OperatorStats {
  operatorname: string;
  count: number;
}

export default function PhonesByCNPJ() {
  const params = useParams();
  const cnpj = Array.isArray(params?.cnpj) ? params.cnpj[0] : params?.cnpj ?? '';
  const [phones, setPhones] = useState<Phone[]>([]);
  const [operatorStats, setOperatorStats] = useState<OperatorStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhones() {
      try {
        const response = await fetch(`/api/stats/relative/listOperators/listPhonesByCNPJ/${cnpj}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar telefones');
        }
        const data: Phone[] = await response.json();
        setPhones(data);

        // Gerar estatísticas por operadora
        const statsMap: Record<string, number> = {};
        data.forEach(({ operatorname }) => {
          statsMap[operatorname] = (statsMap[operatorname] || 0) + 1;
        });
        
        const statsArray = Object.entries(statsMap).map(([operatorname, count]) => ({ operatorname, count }));
        setOperatorStats(statsArray);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (cnpj) {
      fetchPhones();
    }
  }, [cnpj]);

  if (loading) return <CircleLoading />;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue-700 font-bold mb-4">Telefones do CNPJ {cnpj} - {phones[0]?.companyname} - {phones.length} linha(s) </h1>

      <Link href="/statistics/relative/listoperators" className="text-blue-500 hover:underline mb-4 block">
        ← Voltar para a lista de operadoras
      </Link>

      {/* Estatísticas de Linhas por Operadora */}
      <div className="bg-gray-100 shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold">Estatísticas por Operadora</h2>
        <ul>
          {operatorStats.map(({ operatorname, count }) => {
              const percentage = ((count / phones.length) * 100).toFixed(2);
            return (
              <li key={operatorname || 'n/d'}>
                <strong>{operatorname || 'n/d'}:</strong> {count} linha(s) ({percentage}%)
              </li>
            );
          })}
        </ul>
      </div>

      {/* Lista de Telefones */}
      <ul className="bg-white shadow-md rounded-lg p-4">
        {phones.map(({ startofcontract, operatorname, city, state, mobilephone1 }, index) => (
          <li key={index}>
            {mobilephone1} - {operatorname} - {startofcontract} - {city}/{state} 
          </li>
        ))}
      </ul>
    </div>
  );
}
