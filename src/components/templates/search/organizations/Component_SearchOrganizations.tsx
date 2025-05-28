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
  relatednumbers: { 
    mobilephone1: string,
    operatorname: string,
    startofcontract: string,
    ported: boolean,
  }[];
}

const SearchOrganizations = () => {
  const [cnpj, setCnpj] = useState('');
  const [name, setName] = useState('');
  const [name2, setName2] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrganizationResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationResult | null>(null);

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

  interface FormatDate {
    (dateStr: string | undefined): string;
  }

  const formatDate: FormatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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
          placeholder="Nome (Razão Social ou Fantasia)"
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          placeholder="Nome (Email, Responsável Qualificado, Sócios)"
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
              <li
                key={org.idCompany}
                className="p-2 break-words cursor-pointer hover:bg-blue-50"
                onClick={() => setSelectedOrg(org)}
              >
                <p><strong>CNPJ:</strong> <span className="text-blue-700 underline">{org.cnpj}</span></p>
                <p><strong>Nome:</strong> {org.companyname}</p>
                <p><strong>Telefones ({org.relatednumbers.length})</strong></p>
                {/*  :</strong>{' '}
                  {org.relatednumbers.map(n => n.mobilephone1).join(', ')}</p>
                <p><strong>Natureza Jurídica:</strong> {org.legalnature}</p>
                <p><strong>Porte da Empresa:</strong> {org.companysize}</p>
                <p><strong>Porte Opcional:</strong> {org.optionalsize ? 'Sim' : 'Não'}</p>
                <p><strong>Optante MEI:</strong> {org.optionmei ? 'Sim' : 'Não'}</p>*/}
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

      {/* Modal puro com Tailwind */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] relative flex flex-col">
            <button
              onClick={() => setSelectedOrg(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>
            <div className="p-6 overflow-y-auto h-[80vh]">
              <h3 className="text-xl font-bold mb-4">Detalhes da Empresa</h3>
              <p><strong>CNPJ:</strong> {selectedOrg.cnpj}</p>
              <p><strong>Nome:</strong> {selectedOrg.companyname}</p>
              <p><strong>Natureza Jurídica:</strong> {selectedOrg.legalnature}</p>
              <p><strong>Porte da Empresa:</strong> {selectedOrg.companysize}</p>
              <p><strong>Porte Opcional:</strong> {selectedOrg.optionalsize ? 'Sim' : 'Não'}</p>
              <p><strong>Optante MEI:</strong> {selectedOrg.optionmei ? 'Sim' : 'Não'}</p>
              <p className="mt-4"><strong>Telefones ({selectedOrg.relatednumbers.length}):</strong></p>
              <table className="w-full text-sm text-left border border-gray-200">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2">Número</th>
                    <th className="px-3 py-2">Operadora</th>
                    <th className="px-3 py-2">Início do Contrato</th>
                    <th className="px-3 py-2">Portou</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrg.relatednumbers.map((num, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">{num.mobilephone1}</td>
                      <td className="px-3 py-2">{num.operatorname}</td>
                      <td className="px-3 py-2">{formatDate(num.startofcontract)}</td>
                      <td className="px-3 py-2">{num.ported ? 'Sim' : 'Não'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-right">
              <button
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchOrganizations;
