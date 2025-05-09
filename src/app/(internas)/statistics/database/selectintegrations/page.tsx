'use client';

import { useState } from 'react';

const Page = () => {
  const [loadingBRF, setLoadingBRF] = useState(false);
  const [loadingBDO, setLoadingBDO] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSyncBRF = async () => {
    const confirmed = confirm('Tem certeza que deseja iniciar a integração BRF?');
    if (!confirmed) return;

    setLoadingBRF(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/database/sync/federalrevenue-to-organizations', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido.');

      setMessage(data.message || 'Sincronização BRF finalizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao executar a integração BRF.');
    } finally {
      setLoadingBRF(false);
    }
  };

  const handleSyncBDO = async () => {
    const confirmed = confirm('Tem certeza que deseja iniciar a sincronização BDO com Numbers?');
    if (!confirmed) return;

    setLoadingBDO(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/database/sync/bdo-to-numbers', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido.');

      setMessage(data.message || 'Sincronização BDO finalizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao executar a sincronização BDO.');
    } finally {
      setLoadingBDO(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-11/12 h-screen items-center bg-gray-600 space-y-4">
      <button
        type="button"
        onClick={handleSyncBRF}
        disabled={loadingBRF}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:opacity-50"
      >
        {loadingBRF ? 'Integrando BRF...' : 'Integrar BRF'}
      </button>

      <button
        type="button"
        onClick={handleSyncBDO}
        disabled={loadingBDO}
        className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800 disabled:opacity-50"
      >
        {loadingBDO ? 'Sincronizando BDO...' : 'Sincronizar BDO → Numbers'}
      </button>

      {message && <p className="mt-2 text-green-200">{message}</p>}
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
};

export default Page;
