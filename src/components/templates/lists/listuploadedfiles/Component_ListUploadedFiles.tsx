"use client";
import { useEffect, useState } from "react";

type FileRecord = {
  idFile: number;
  name: string;
  path: string;
  sincronized: boolean;
};

export default function ListaArquivos() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/database/getlistuploadedfiles")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar arquivos:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Arquivos na pasta uploads/</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : files.length === 0 ? (
        <p>Nenhum arquivo encontrado.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Nome</th>
              <th className="p-2">Caminho</th>
              <th className="p-2">Sincronizado</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.idFile} className="border-t">
                <td className="p-2">{file.name}</td>
                <td className="p-2">{file.path}</td>
                <td className="p-2">
                  {file.sincronized ? "✅ Sim" : "❌ Não"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
