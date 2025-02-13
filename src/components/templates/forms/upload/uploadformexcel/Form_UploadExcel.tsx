'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UploadPageExcel() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [progress, setProgress] = useState(0);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");

  interface FormData {
    file: FileList;
  }

  interface UploadResponse {
    count: number; // Adiciona a contagem de registros
    data: Record<string, unknown>;
  }

  const onSubmit = async (data: FormData) => {
    if (!data.file[0]) {
      setMessage("Selecione um arquivo!");
      return;
    }

    setProgress(0);
    setMessage("");

    const formData = new FormData();
    formData.append("file", data.file[0]);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploadExcel", true);

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const response: UploadResponse = JSON.parse(xhr.responseText);
        setJsonData(response.data);
        setMessage(`Arquivo enviado com sucesso! Total de registros: ${response.count - 1}`);
        reset();
      } else {
        setMessage(`Erro no upload! ${xhr.responseText}`);
      }
      setProgress(0);
    };

    xhr.onerror = () => {
      setMessage("Erro de conexão!");
      setProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
      <h2>Upload de Excel</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-3">

        <input type="file" {...register("file")} accept=".xlsx, .xls" />
        <button className="bg-yellow-300" type="submit">Enviar</button>

      </form>

      {progress > 0 && (
        <div style={{ marginTop: "10px", width: "100%", backgroundColor: "#ddd" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "10px",
              backgroundColor: "green",
            }}
          />
        </div>
      )}

      {message && <p>{message}</p>}

      {jsonData && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h3>Dados Extraídos:</h3>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
