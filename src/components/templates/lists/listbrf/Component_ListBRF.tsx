"use client";

import { useState } from "react";

export interface FileType {
  name: string;
  path: string | null;
  recordCount: number | null;
  origin: string | null;
  createdAt: Date;
  sincronized?: boolean; // 🔹 Indica se o arquivo já foi sincronizado
}

interface Props {
  files: {
    fileNames: FileType[];
    error?: string;
  };
}

const Component_ListBRF = ({ files }: Props) => {
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: string }>({});
  const [fileList, setFileList] = useState<FileType[]>(files.fileNames);

  // 🔹 Filtra apenas arquivos com origem "BRF"
  const filteredFiles = fileList.filter((file) => file.origin === "BRF");

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: file.name, path: file.path }),
      });

      const result = await response.json();

      if (response.ok) {
        setSyncStatus((prev) => ({ ...prev, [file.name]: "✅ Sincronizado!" }));

        // 🔹 Atualiza a lista de arquivos, marcando o arquivo como sincronizado
        setFileList((prevFiles) =>
          prevFiles.map((f) =>
            f.name === file.name ? { ...f, sincronized: true } : f
          )
        );
      } else {
        setSyncStatus((prev) => ({ ...prev, [file.name]: `❌ Erro: ${result.error}` }));
      }
    } catch (error) {
      console.log(error);
      setSyncStatus((prev) => ({ ...prev, [file.name]: "❌ Erro na sincronização" }));
    }
  };

  return (
    <div>
      <h2>Arquivos da Base de Dados da Receita Federal (Origem: BRF)</h2>

      {files.error ? (
        <p className="text-red-500">{files.error}</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index} className="mb-4 border p-2 rounded">
              <strong>Nome:</strong> {file.name} <br />
              <strong>Registros:</strong> {file.recordCount ?? "N/A"} <br />
              <strong>Origem:</strong> {file.origin ?? "Desconhecida"} <br />
              <strong>Criado em:</strong> {new Date(file.createdAt).toLocaleString()} <br />

              {/* Botão Sincronizar */}
              <button
                  className={`mt-2 px-4 py-2 rounded ${
                    file.sincronized || syncStatus[file.name] === "⏳ Sincronizando..."
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  onClick={() => handleSync(file)}
                  disabled={file.sincronized || syncStatus[file.name] === "..."}
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
