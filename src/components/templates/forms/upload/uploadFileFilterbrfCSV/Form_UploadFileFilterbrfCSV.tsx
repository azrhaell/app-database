"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UploadFilterbrfCSV() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🔹 Estado de carregamento
  const [isProcessing, setIsProcessing] = useState(false); // 🔹 Indica que está processando após o upload

  interface FormData {
    file: FileList;
  }

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);

    setProgress(0);
    setMessage("");
    setIsLoading(true); // 🔹Ativa o loading inicial

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/routebrfcsv", true);

      // 🔹 Atualiza a barra de progresso
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);

          // 🔹 Se o progresso chegar a 100%, ativa o estado de processamento
          if (percent === 100) {
            setIsProcessing(true);
          }
        }
      };

      xhr.onload = () => {
        setIsLoading(false); // 🔹 Desativa o loading
        setIsProcessing(false); // 🔹 Indica que terminou o processamento
        if (xhr.status === 200) {
          setMessage("✅ Arquivo recebido e verificado com sucesso!");
          reset();
        } else {
          setMessage("❌ Erro ao processar o arquivo.");
        }
        setProgress(0);
      };

      xhr.onerror = () => {
        setIsLoading(false);
        setIsProcessing(false);
        setMessage("❌ Erro na conexão com o servidor.");
        setProgress(0);
      };

      xhr.send(formData);
    } catch {
      setIsLoading(false);
      setIsProcessing(false);
      setMessage("❌ Erro inesperado.");
      setProgress(0);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Upload de CSV da Receita Federal</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register("file")} className="mb-2" disabled={isLoading} />
        <button
          type="submit"
          className={`p-2 rounded-md text-white ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Verificar CSV"}
        </button>
      </form>

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* 🔹 "Filtrando arquivo..." só aparece após progresso 100% */}
      {isProcessing && <p className="mt-2 text-sm text-blue-600">⏳ Verificando arquivo...</p>}

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
