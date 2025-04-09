"use client"

import { useState } from "react";

const DownloadLink = () => {
  const [tipo, setTipo] = useState("movel");
  const chave = "RC0Pm0Oy69K8";

  const baseUrl = "http://integrador.telein.com.br/download.php";
  
  const handleDownload = (includeMd5 = false) => {
    let url = `${baseUrl}?chave=${chave}&tipo=${tipo}`;
    if (includeMd5) {
      url += "&md5";
    }
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-sm">
      <h2 className="text-xl font-bold mb-4">Baixar Arquivo</h2>
      <select 
        className="border p-2 rounded w-full mb-4"
        value={tipo} 
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="movel">Móvel</option>
        <option value="completo">Completo</option>
        <option value="movel_data">Móvel com Data</option>
        <option value="completo_data">Completo com Data</option>
        <option value="movel_prefixos">Móvel Prefixos</option>
        <option value="completo_prefixos">Todos Prefixos</option>
        <option value="completo_prefixos_mcdu">Todos Prefixos + MCDU</option>
      </select>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
        onClick={() => handleDownload(false)}
      >
        Baixar Arquivo
      </button>
      <button 
        className="bg-gray-500 text-white px-4 py-2 rounded w-full"
        onClick={() => handleDownload(true)}
      >
        Baixar MD5
      </button>
    </div>
  );
};

export default DownloadLink;
