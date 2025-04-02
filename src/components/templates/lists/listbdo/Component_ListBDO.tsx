"use client";

import { useState, useEffect } from "react";

export interface FileType {
  name: string;
  path: string | null;
  qtdregisters: number | null;
  origin: string | null;
  created: Date;
  sincronized?: boolean; // 🔹 Indica se o arquivo já foi sincronizado
}

interface Props {
  files: {
    fileNames: FileType[];
    error?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Component_ListBDO = ({ files }: Props) => {
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // 🔹 Função para buscar os arquivos no servidor
  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch("/api/database/getfilesbdo");
      const result = await response.json();

      if (response.ok) {
        setFileList(result.fileNames);
      } else {
        console.error("Erro ao carregar arquivos:", result.error);
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // 🔹 Buscar arquivos ao montar o componente
  useEffect(() => {
    fetchFiles();
  }, []);

  // 🔹 Função para sincronizar um arquivo
  const handleSync = async (file: FileType) => {
    if (!file.path) return alert("Caminho do arquivo inválido.");

    setLoading(file.name);

    try {
      const response = await fetch("/api/syncBDO", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, path: file.path }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}`);
        fetchFiles(); // Atualiza a lista após sincronização
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      alert("Erro ao sincronizar o arquivo.");
    } finally {
      setLoading(null);
    }
  };

  // 🔹 Filtra apenas arquivos com origem "BDO"
  const filteredFiles = fileList.filter((file) => file.origin === "BDO");

  return (
    <div>
      <h2>Arquivos da Base de Dados de Operadoras (Origem: BDO)</h2>

      <button onClick={fetchFiles} className="px-4 py-2 bg-green-500 text-white rounded mb-4">
        Recarregar Lista
      </button>

      {isLoadingFiles ? (
        <p>Carregando arquivos...</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file) => (
            <li key={file.name} className="mb-4 p-2 border">
              <strong>Nome:</strong> {file.name} <br />
              <strong>Registros:</strong> {file.qtdregisters ?? "N/A"} <br />
              <strong>Origem:</strong> {file.origin ?? "Desconhecida"} <br />
              <strong>Criado em:</strong> {new Date(file.created).toLocaleString()} <br />
              <button
                onClick={() => handleSync(file)}
                disabled={loading === file.name}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                {loading === file.name ? "Sincronizando..." : "Sincronizar"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum arquivo encontrado com origem BDO.</p>
      )}
    </div>
  );
};

export default Component_ListBDO;
