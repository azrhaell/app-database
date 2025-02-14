'use client';

import { useState } from 'react';

interface FileType {
  name: string;
  createdAt: string;
  recordCount: number;
}

export default function Home({ files = [] }: { files: FileType[] }) {
  const [loadingFiles, setLoadingFiles] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState('');

  async function handleUpload(fileName: string) {
    setLoadingFiles((prev) => ({ ...prev, [fileName]: true }));
    setMessage('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json() as { message?: string; error?: string };

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch {
      setMessage('❌ Erro ao conectar com o servidor.');
    }

    setLoadingFiles((prev) => ({ ...prev, [fileName]: false }));
  }

  return (
    <div className="flex flex-col w-11/12 h-screen bg-gray-600">
      <h1 className="text-2xl font-bold mb-4">Lista de Arquivos</h1>
      {message && <p className="p-2 text-white bg-blue-500 rounded">{message}</p>}
      <ul className="space-y-2">
        {files.length > 0 ? (
          files.map((file, index) => (
            <li key={index} className="border p-2 rounded-lg shadow flex justify-between items-center">
              <div>
                <p><strong>Nome:</strong> {file.name}</p>
                <p><strong>Data de Criação:</strong> {new Date(file.createdAt).toLocaleString()}</p>
                <p><strong>Número de Registros:</strong> {file.recordCount}</p>
              </div>
              <button
                onClick={() => handleUpload(file.name)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                disabled={loadingFiles[file.name]}
              >
                {loadingFiles[file.name] ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </li>
          ))
        ) : (
          <p>Nenhum arquivo JSON encontrado.</p>
        )}
      </ul>
    </div>
  );
}
