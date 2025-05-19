'use client';

import { useState } from 'react';

export default function ClearNumbersButton() {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClear = async () => {
    const confirmed = confirm(
      'Tem certeza que deseja apagar TODOS os registros da tabela "numbers"? Esta ação é irreversível.'
    );
    if (!confirmed) return;

    const token = prompt('Digite o token de autenticação:');
    if (!token) {
      alert('Operação cancelada. Token não informado.');
      return;
    }

    setLoading(true);
    setResponseMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/config/delete/numbers?token=${encodeURIComponent(token)}`, {
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
        {loading ? 'Apagando...' : 'Apagar todos os números'}
      </button>
      {responseMessage && <p className="mt-2 text-green-700">{responseMessage}</p>}
      {errorMessage && <p className="mt-2 text-red-700">{errorMessage}</p>}
    </div>
  );
}
