'use client';
import React, { useState } from 'react';

interface OrganizationResult {
  idCompany: string;
  cnpj: string;
  companyname: string;
  legalnature: string;
  companysize: string;
  optionalsize: boolean;
  optionmei: boolean;
  relatednumbers: { mobilephone1: string }[];
}

const SearchOrganizations = () => {
  const [cnpj, setCnpj] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrganizationResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const handleSearch = async (targetPage = 1) => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/search/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, name, phone, page: targetPage }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao buscar dados');

      setResults(json.data);
      setPage(json.page);
      setTotalPages(json.totalPages);
    } catch (error) {
      console.error(error);
      alert('Erro ao realizar a busca');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    handleSearch(newPage);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pesquisar Empresas e Linhas</h2>
      <div className="flex flex-row flex-wrap gap-2 max-w-full">
        <input
          type="text"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          placeholder="CNPJ"
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (Razão ou Fantasia)"
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone"
          className="border p-2 rounded"
        />
        <button
          onClick={() => handleSearch(1)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              Pesquisando...
            </span>
          ) : (
            'Pesquisar'
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="font-semibold mb-2">
            Resultados (Página {page} de {totalPages}):
          </h3>
          <ul className="divide-y divide-gray-300 border rounded mb-4 min-w-[700px]">
            {results.map((org) => (
              <li key={org.idCompany} className="p-2 break-words">
                <p><strong>CNPJ:</strong> {org.cnpj}</p>
                <p><strong>Nome:</strong> {org.companyname}</p>
                <p><strong>Telefones ({org.relatednumbers.length}):</strong>{' '}
                  {org.relatednumbers.map(n => n.mobilephone1).join(', ')}</p>
                <p><strong>Natureza Jurídica:</strong> {org.legalnature}</p>
                <p><strong>Porte da Empresa:</strong> {org.companysize}</p>
                <p><strong>Porte Opcional:</strong> {org.optionalsize ? 'Sim' : 'Não'}</p>
                <p><strong>Optante MEI:</strong> {org.optionmei ? 'Sim' : 'Não'}</p>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchOrganizations;
