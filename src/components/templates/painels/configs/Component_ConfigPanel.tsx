'use client';
import Link from 'next/link';
import React, { useState } from 'react';

const Component_ConfigPanel = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdjustOperatorName = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/config/adjustoperatorname', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao corrigir dados.');

      setMessage('Correção concluída com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao corrigir dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetNumbers = async () => {
    const token = prompt('Digite o token de segurança para resetar os dados:');
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/config/resetnumbers?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido.');
      }

      setMessage(data.message || 'Campos redefinidos com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao redefinir dados.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetRfStatus = async () => {
    const token = prompt('Digite o token de segurança para redefinir o status RF:');
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/config/resetstatusrf?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido.');
      }

      setMessage(data.message || 'Status RF redefinido com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao redefinir status RF.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-2 m-2'>
        <h2>Normalização de Dados</h2>
        <div className='flex flex-col gap-2 w-1/6'>
          <button
            onClick={handleAdjustOperatorName}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Corrigindo...' : 'Nomes de Operadora'}
          </button>
          <button
            onClick={handleResetNumbers}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            {loading ? 'Redefinindo...' : 'Resetar Portabilidade'}
          </button>
          <button
            onClick={handleResetRfStatus}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            {loading ? 'Resetando...' : 'Resetar Status RF'}
          </button>
        </div>

        {message && (
          <p className={`mt-2 ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-2 m-2'>
        <h2>Arquivos</h2>
        <Link href="/files">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Listar Arquivos
          </button>
        </Link>
      </div>

      <div className='flex flex-col gap-2 m-2'>
        <h2>Gerenciar</h2>
        <Link href="/configs/create/operators">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Incluir Operadora Telefônica
          </button>
        </Link>
      </div>  

      <div className='flex flex-col gap-2 m-2'>
        <Link href="/configs/delete/numbers">
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Excluir Todos os Telefones
          </button>
        </Link>
        <Link href="/configs/delete/organizations">
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Excluir Todas as Empresas
          </button>
        </Link>
      </div>
    </>
  );
};

export default Component_ConfigPanel;
