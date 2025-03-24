'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Phone {
  companyname: string;
  mobilephone1: string;
  startofcontract: string;
  operatorname: string;
  city: string;
  state: string;
}

export default function CNPJSearchForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: { cnpj: string }) => {
    setLoading(true);
    setError(null);
    setPhones([]);

    try {
      const response = await fetch(`/api/stats/relative/listOperators/listPhonesByCNPJ/${data.cnpj}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar telefones');
      }
      const result: Phone[] = await response.json();
      setPhones(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Buscar Telefones por CNPJ</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input 
          type="text" 
          placeholder="Digite o CNPJ" 
          {...register('cnpj', { required: 'CNPJ é obrigatório' })} 
          className="border p-2 rounded w-full mb-2"
        />
        {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj.message}</p>}
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Buscar</button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      
      {phones.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Resultados</h2>
          <ul>
            {phones.map(({ mobilephone1, operatorname, startofcontract, city, state }, index) => (
              <li key={index}>
                {mobilephone1} - {operatorname} - {startofcontract} - {city}/{state}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
