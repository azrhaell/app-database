'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Line {
    mobilephone1: string;
    cnpj: string;
    companyname: string;
    startofcontract: true,
    city: true,
    state: true,
    operatorname: true,
}

export default function OperatorLines() {
  //const { operatorname } = useParams();
  const params = useParams();
  const operatorname = Array.isArray(params?.operatorname) ? params.operatorname[0] : params?.operatorname ?? '';
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLines() {
      try {
        const response = await fetch(`/api/stats/relative/listOperators/listPhones/${operatorname}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar linhas');
        }
        const data: Line[] = await response.json();
        setLines(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (operatorname) {
      fetchLines();
    }
  }, [operatorname]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue-700 font-bold mb-4">Linhas da Operadora {operatorname}</h1>
      <Link href="/statistics/relative/listoperators" className="text-blue-500 hover:underline mb-4 block">← Voltar para a lista de operadoras</Link>
      <ul className="bg-white shadow-md rounded-lg p-4">
        {lines.map(({ mobilephone1, cnpj, companyname, startofcontract, city, state }, index) => (
            <li key={index}>

          <Link href={`/statistics/relative/listoperators/listPhonesByCNPJ/${cnpj}`} className="text-blue-500 hover:underline">
            {cnpj}
          </Link> - {companyname} - {mobilephone1} - {startofcontract} - {city} - {state} -

            </li>
        ))}
      </ul>
    </div>
  );
}
