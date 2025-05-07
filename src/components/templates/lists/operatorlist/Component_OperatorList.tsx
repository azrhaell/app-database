'use client';

import { useEffect, useState } from 'react';

interface OperatorCount {
  name: string;
  description: string | null;
  codeoperador: string | null;
  codeantel: string | null;
}

export default function OperatorList() {
  const [operators, setOperators] = useState<OperatorCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOperators() {
      try {
        const response = await fetch('/api/stats/relative/listOperators');
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
      {operators.map(({ name, description, codeoperador, codeantel }) => (
        <li key={name} className="mb-2">
          <strong>{name}</strong>
          <p className="text-sm text-gray-600">
            {description || 'Sem descrição'}
          </p>
          <p className="text-sm">
            <span className="mr-2">Código Operadora: {codeoperador || 'N/A'}</span>
            <span>Código Anatel: {codeantel || 'N/A'}</span>
          </p>
        </li>
      ))}
      </ul>
    </div>
  );
}
