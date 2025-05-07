'use client';

import { useEffect, useState } from 'react';

interface RevenueData {
  cnpj: string;
  companyname: string;
  legalnature: string;
  companysize: string;
  optionalsize: boolean;
  optionmei: boolean;
}

export default function FederalRevenueList() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchData() {
    try {
      const response = await fetch('/api/stats/relative/federalrevenue/listpartialbrf');
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const json = await response.json();
      setData(json.records);
      setTotal(json.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDeleteAll() {
    setDeleting(true);
    try {
      const response = await fetch('/api/stats/relative/federalrevenue/deletebrf', { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir registros');
      await fetchData();
      setShowModal(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Amostra de Empresas (até 100)</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={total === 0}
          className={`px-4 py-2 rounded text-white ${
            total === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Remover todos
        </button>
      </div>

      <p className="mb-4 text-gray-700">
        Total de registros na tabela: <strong>{total.toLocaleString()}</strong>
      </p>

      <table className="min-w-full border border-gray-300 rounded-md text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border">CNPJ</th>
            <th className="px-4 py-2 border">Empresa</th>
            <th className="px-4 py-2 border">Natureza Jurídica</th>
            <th className="px-4 py-2 border">Porte</th>
            <th className="px-4 py-2 border">Simples</th>
            <th className="px-4 py-2 border">MEI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.cnpj}>
              <td className="px-4 py-2 border">{item.cnpj}</td>
              <td className="px-4 py-2 border">{item.companyname}</td>
              <td className="px-4 py-2 border">{item.legalnature}</td>
              <td className="px-4 py-2 border">{item.companysize}</td>
              <td className="px-4 py-2 border">{item.optionalsize ? 'Sim' : 'Não'}</td>
              <td className="px-4 py-2 border">{item.optionmei ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Confirmar Exclusão</h2>
            <p className="mb-4">
              Esta ação é <strong>DEFINITIVA</strong>. Tem certeza que deseja remover <strong>TODOS</strong> os registros da base de dados da <strong>RECEITA FEDERAL</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Removendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
