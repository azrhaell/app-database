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

const Component_ListBDMailing = ({ files }: Props) => {
  // 🔹 Filtra apenas arquivos com origem "BDMailing"
  const filteredFiles = files.fileNames.filter((file) => file.origin === "MAILING");

  return (
    <div>
      <h2>Arquivos da Base de Dados Mailing (Origem: Mailing)</h2>

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
        <p>Nenhum arquivo encontrado com origem Mailing.</p>
      )}
    </div>
  );
};

export default Component_ListBDMailing;
*/
"use client";

import { useState } from "react";

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

const Component_ListBDMailing = ({ files }: Props) => {
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: string }>({});

  const handleSync = async (file: FileType) => {
    if (!file.path) return;
    setSyncStatus((prev) => ({ ...prev, [file.name]: "Sincronizando..." }));

    try {
      const response = await fetch("/api/syncBDMailing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, path: file.path }),
      });
      const result = await response.json();

      if (response.ok) {
        setSyncStatus((prev) => ({ ...prev, [file.name]: "Sincronizado com sucesso!" }));
      } else {
      setSyncStatus((prev) => ({ ...prev, [file.name]: `Erro: ${result.error}` }));
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus((prev) => ({ ...prev, [file.name]: "Erro na sincronização." }));
    }
  };

  const filteredFiles = files.fileNames.filter((file) => file.origin === "MAILING");

  return (
    <div>
      <h2>Arquivos da Base de Dados Mailing (Origem: Mailing)</h2>
      {files.error ? (
        <p className="text-red-500">{files.error}</p>
      ) : filteredFiles.length > 0 ? (
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index} className="mb-4 border-b pb-2">
              <strong>Nome:</strong> {file.name} <br />
              <strong>Registros:</strong> {file.recordCount ?? "N/A"} <br />
              <strong>Origem:</strong> {file.origin ?? "Desconhecida"} <br />
              <strong>Criado em:</strong> {new Date(file.createdAt).toLocaleString()} <br />
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => handleSync(file)}
                disabled={syncStatus[file.name]?.includes("Sincronizado")}
              >
                Sincronizar
              </button>
              {syncStatus[file.name] && <p className="mt-1 text-sm text-gray-600">{syncStatus[file.name]}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum arquivo encontrado com origem Mailing.</p>
      )}
    </div>
  );
};

export default Component_ListBDMailing;
