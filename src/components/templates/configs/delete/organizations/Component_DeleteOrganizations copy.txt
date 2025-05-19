'use client';

import { useState } from 'react';

export default function ClearOrganizationsButton() {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClear = async () => {
    const confirmed = confirm(
      'Tem certeza que deseja apagar TODOS os registros da tabela "organizations"?\n\n⚠️ Esta ação só será realizada se a tabela "numbers" estiver completamente vazia.'
    );
    if (!confirmed) return;

    setLoading(true);
    setResponseMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/config/delete/organizations?token=TCTelecom2025TC@', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido.');
      }

      setResponseMessage(data.message + ` Total apagados: ${data.totalApagados}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro inesperado ao apagar os registros.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClear}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Apagando...' : 'Apagar todas as organizações'}
      </button>
      {responseMessage && <p className="mt-2 text-green-700">{responseMessage}</p>}
      {errorMessage && <p className="mt-2 text-red-700">{errorMessage}</p>}
    </div>
  );
}
