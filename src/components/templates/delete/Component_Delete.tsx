"use client";

import { useState } from "react";

export default function ClearOrganizationsButton() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClear = async () => {
    if (!confirm("Tem certeza que deseja remover todos os registros?")) return;

    setLoading(true);
    setProgress(10); // Inicia a barra de progresso

    try {
      const res = await fetch("/api/clearOrganizations", { method: "DELETE" });

      setProgress(50); // Atualiza o progresso após a resposta do servidor

      if (!res.ok) {
        throw new Error("Erro ao excluir registros.");
      }

      setProgress(80);
      alert("Todos os registros foram removidos com sucesso!");
    } catch {
      alert("Erro ao remover registros.");
    } finally {
      setProgress(100); // Finaliza a barra de progresso

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500); // Aguarda 500ms antes de esconder a barra
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClear}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Removendo..." : "Remover Registros"}
      </button>
      {loading && (
        <div className="w-full bg-gray-200 mt-2 rounded">
          <div
            className="h-2 bg-red-500 rounded"
            style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}
          />
        </div>
      )}
    </div>
  );
}
