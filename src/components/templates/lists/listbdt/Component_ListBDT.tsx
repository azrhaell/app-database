/*"use client";

export interface FileType {
  name: string;
  path: string | null;
  recordCount: number | null;
  origin: string | null;
  createdAt: Date;
}

interface Props {
  files: {
    fileNames: FileType[];
    error?: string;
  };
}

const Component_ListBDT = ({ files }: Props) => {
  // 🔹 Filtra apenas arquivos com origem "BDT"
  const filteredFiles = files.fileNames.filter((file) => file.origin === "BDT");

  return (
    <div>
      <h2>Arquivos da Base de Dados de Terceiros (Origem: BDT)</h2>

      {files.error ? (
        <p className="text-red-500">{files.error}</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index}>
              <strong>Nome:</strong> {file.name} <br />
              <strong>Registros:</strong> {file.recordCount ?? "N/A"} <br />
              <strong>Origem:</strong> {file.origin ?? "Desconhecida"} <br />
              <strong>Criado em:</strong> {new Date(file.createdAt).toLocaleString()} <br />
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum arquivo encontrado com origem BDT.</p>
      )}
    </div>
  );
};

export default Component_ListBDT;
*/
"use client";

import { useState } from "react";

export interface FileType {
  name: string;
  path: string | null;
  qtdregisters: number | null;
  origin: string | null;
  created: Date;
}

interface Props {
  files: {
    fileNames: FileType[];
    error?: string;
  };
}

const Component_ListBDT = ({ files }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSync = async (file: FileType) => {
    if (!file.path) return alert("Caminho do arquivo inválido.");

    setLoading(file.name);

    try {
      const response = await fetch("/api/syncBDT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, path: file.path }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}`);
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
  const filteredFiles = files.fileNames.filter((file) => file.origin === "BDT");

  return (
    <div>
      <h2>Arquivos da Base de Terceiros (Origem: BDT)</h2>

      {files.error ? (
        <p className="text-red-500">{files.error}</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file) => (
            <li key={file.name}>
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
        <p>Nenhum arquivo encontrado com origem BDT.</p>
      )}
    </div>
  );
};

export default Component_ListBDT;
