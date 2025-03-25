'use client';

import { useEffect, useState } from 'react';
import { FileType } from './page';

interface Props {
  initialFiles: {
    fileNames: FileType[];
    error?: string;
  };
}

export default function Home({ initialFiles }: Props) {
  const [fileList, setFileList] = useState<FileType[]>(initialFiles.fileNames);
  const [loadingFiles, setLoadingFiles] = useState<{ [key: string]: boolean }>({});
  //const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchFiles() {
    //setLoading(true);

    try {
      const response = await fetch('/api/database/getjsonfiles', {
        cache: 'no-store', // Força busca sem cache
      });
      const data = await response.json();
      setFileList(data.fileNames);
    } catch {
      setMessage('Erro ao buscar arquivos.');
    }
    //setLoading(false);
  }

  useEffect(() => {
    fetchFiles(); // Buscar sempre que a página for montada
  }, []);

  async function handleUpload(fileName: string) {
    //setLoading(true);
    //**********************
    const fullFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`; // ✅ Garante que tem .json
    console.log(`Iniciando upload de ${fullFileName}`); // 🔍 Debug
    //**********************
    setLoadingFiles((prev) => ({ ...prev, [fileName]: true }));
    setMessage('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName }),
        headers: { 'Content-Type': 'application/json' },
      });
      //const data = await response.json();
      const data = await response.json() as { message?: string; error?: string };
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchFiles(); // Atualiza lista após upload
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch {
      setMessage('❌ Erro ao conectar com o servidor.');
    }

    //setLoading(false);
    //*******************
    setTimeout(() => {
      setLoadingFiles((prev) => ({ ...prev, [fullFileName]: false }));
      console.log(`Upload concluído para ${fullFileName}`); // 🔍 Debug
    }, 500);
    //*************************
  }

  return (
    <div className="flex flex-col w-11/12 h-screen bg-gray-600">
      <h1 className="text-2xl font-bold mb-4">Lista de Arquivos</h1>
      {message && <p className="p-2 text-white bg-blue-500 rounded">{message}</p>}
      <button onClick={fetchFiles} className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4">
        Atualizar Lista
      </button>
      <ul className="space-y-2">
        {fileList.length > 0 ? (
          fileList.map((file) => {
            const fullFileName = file.name.endsWith('.json') ? file.name : `${file.name}.json`; // ✅ Adiciona .json se necessário
            return (
              <li key={fullFileName} className="border p-2 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p><strong>📂 Nome:</strong> {file.name.replace('.json', '')}</p>
                  <p><strong>📅 Data do Upload:</strong> {new Date(file.createdAt).toLocaleString()}</p>
                  <p><strong>📊 Registros:</strong> {file.recordCount}</p>
                  <p><strong>🌎 Origem:</strong> {file.origin}</p>
                </div>
                <button
                  onClick={() => handleUpload(file.name)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  disabled={loadingFiles[fullFileName] || false}
                >
                  {loadingFiles[fullFileName] ? '⏳ Salvando...' : '💾 Salvar'}
                </button>
              </li>
            );
          })
        ) : (
          <p>Nenhum arquivo encontrado.</p>
        )}
      </ul>
    </div>
  );
}