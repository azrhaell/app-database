'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OperatorCount {
  operatorname: string;
  count: number;
}

export default function OperatorList() {
  const [operators, setOperators] = useState<OperatorCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOperators() {
      try {
        const response = await fetch('/api/operators');
        if (!response.ok) {
          throw new Error('Erro ao buscar operadoras');
        }
        const data: OperatorCount[] = await response.json();
        setOperators(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOperators();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Operadoras</h1>
      <ul className="bg-white shadow-md rounded-lg p-4">
        {operators.map(({ operatorname, count }) => (
          <li key={operatorname}>
            <Link href={`/operator/${operatorname}`} className="text-blue-500 hover:underline">
              <strong>{operatorname}:</strong> {count} linhas
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
