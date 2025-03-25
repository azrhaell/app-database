'use client';

import { useEffect, useState } from 'react';
import { FileType } from './page';

interface Props {
  initialFiles: FileType[];
}

export default function Home({ initialFiles }: Props) {
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchFiles() {
    setLoading(true);
    try {
      const response = await fetch('/api/database/getjsonfiles', {
        cache: 'no-store', // Força busca sem cache
      });
      const data = await response.json();
      setFiles(data.fileNames);
    } catch {
      setMessage('Erro ao buscar arquivos.');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles(); // Buscar sempre que a página for montada
  }, []);

  async function handleUpload(fileName: string) {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchFiles(); // Atualiza lista após upload
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch {
      setMessage('❌ Erro ao conectar com o servidor.');
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col w-11/12 h-screen bg-gray-600">
      <h1 className="text-2xl font-bold mb-4">Lista de Arquivos</h1>
      {message && <p className="p-2 text-white bg-blue-500 rounded">{message}</p>}
      <button onClick={fetchFiles} className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4">
        Atualizar Lista
      </button>
      <ul className="space-y-2">
        {files.length > 0 ? (
          files.map((file, index) => (
            <li key={index} className="border p-2 rounded-lg shadow flex justify-between items-center">
              <div>
                <p><strong>Nome:</strong> {file.name}</p>
                <p><strong>Data do Upload:</strong> {new Date(file.createdAt).toLocaleString()}</p>
                <p><strong>Número de Registros:</strong> {file.recordCount}</p>
                <p><strong>Origem:</strong> {file.origin}</p>
              </div>
              <button
                onClick={() => handleUpload(file.name)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </li>
          ))
        ) : (
          <p>Nenhum arquivo encontrado.</p>
        )}
      </ul>
    </div>
  );
}
