'use client';
import React, { useState } from 'react';

interface OrganizationResult {
  idCompany: string;
  cnpj: string;
  companyname: string;
  relatednumbers: { mobilephone1: string }[];
}

const SearchOrganizations = () => {
  const [cnpj, setCnpj] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrganizationResult[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/search/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, name, phone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao buscar dados');

      setResults(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao realizar a busca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pesquisar Organizações</h2>
      <div className="flex flex-col gap-2 max-w-md">
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
          onClick={handleSearch}
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
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Resultados:</h3>
          <ul className="divide-y divide-gray-300 border rounded">
            {results.map((org) => (
              <li key={org.idCompany} className="p-2">
                <p><strong>CNPJ:</strong> {org.cnpj}</p>
                <p><strong>Nome:</strong> {org.companyname}</p>
                <p><strong>Telefone:</strong> {org.relatednumbers.map((n: { mobilephone1: string }) => n.mobilephone1).join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchOrganizations;
