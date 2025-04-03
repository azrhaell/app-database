"use client";

import { useState, useEffect } from "react";

export interface FileType {
  name: string;
  path: string | null;
  qtdregisters: number | null;
  origin: string | null;
  created: Date;
  sincronized?: boolean;
}

interface Props {
  files: {
    fileNames: FileType[];
    error?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Component_ListBRF = ({ files }: Props) => {
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Função para buscar arquivos no banco
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/database/getfilesbrf");
      const result = await response.json();

      if (response.ok) {
        setFileList(result.fileNames);
      } else {
        console.error("Erro ao buscar arquivos:", result.error);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Busca arquivos ao carregar o componente
  useEffect(() => {
    fetchFiles();
  }, []);

  // 🔹 Função para sincronizar um arquivo específico
  const handleSync = async (file: FileType) => {
    if (!file.path) {
      alert("Erro: Caminho do arquivo não encontrado.");
      return;
    }

    setSyncStatus((prev) => ({ ...prev, [file.name]: "⏳ Sincronizando..." }));

    try {
      const response = await fetch("/api/syncBRF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, path: file.path }),
      });

      const result = await response.json();

      if (response.ok) {
        setSyncStatus((prev) => ({ ...prev, [file.name]: "✅ Sincronizado!" }));

        // 🔹 Recarrega os arquivos após sincronizar
        fetchFiles();
      } else {
        setSyncStatus((prev) => ({ ...prev, [file.name]: `❌ Erro: ${result.error}` }));
      }
    } catch (error) {
      console.log(error);
      setSyncStatus((prev) => ({ ...prev, [file.name]: "❌ Erro na sincronização" }));
    }
  };

  // 🔹 Filtra apenas arquivos com origem "BRF"
  const filteredFiles = fileList.filter((file) => file.origin === "BRF");

  return (
    <div>
      <h2>Arquivos da Base de Dados da Receita Federal (Origem: BRF)</h2>

      <button onClick={fetchFiles} className="px-4 py-2 bg-green-500 text-white rounded mb-4">
        Recarregar Lista
      </button>

      {loading ? (
        <p>🔄 Carregando arquivos...</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index} className="mb-4 border p-2 rounded">
              <strong>Nome:</strong> {file.name} <br />
              <strong>Registros:</strong> {file.qtdregisters ?? "N/A"} <br />
              <strong>Origem:</strong> {file.origin ?? "Desconhecida"} <br />
              <strong>Criado em:</strong> {new Date(file.created).toLocaleString()} <br />

              {/* Botão Sincronizar */}
              <button
                className={`mt-2 px-4 py-2 rounded ${
                  file.sincronized || syncStatus[file.name] === "⏳ Sincronizando..."
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={() => handleSync(file)}
                disabled={file.sincronized || syncStatus[file.name] === "⏳ Sincronizando..."}
              >
                {syncStatus[file.name] || (file.sincronized ? "Já sincronizado" : "Sincronizar")}
              </button>

              {/* Status da sincronização */}
              {syncStatus[file.name] && <p className="mt-1 text-sm">{syncStatus[file.name]}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum arquivo encontrado com origem BRF.</p>
      )}
    </div>
  );
};

export default Component_ListBRF;
