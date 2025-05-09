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

  return (
    <>
      <div>
        <h2>Normalização de Dados</h2>
        <button
          onClick={handleAdjustOperatorName}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Corrigindo...' : 'Operadora'}
        </button>

        {message && (
          <p className={`mt-2 ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
      <div>
        <h2>Arquivos</h2>
        <Link href="/files">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Listar Arquivos
          </button>
        </Link>
      </div>
      <div>
        <h2>Gerenciar </h2>
        <Link href="/configs/create/operators">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Incluir Operadora
          </button>
        </Link>
      </div>  
      <div className='flex flex-col gap-2 mt-4'>
          <Link href="/configs/delete/numbers">
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Excluir Tabela Números
            </button>
          </Link>
          <Link href="/configs/delete/organizations">
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Excluir Tabela Organizations
            </button>
          </Link>
      </div>
    </>
  );
};

export default Component_ConfigPanel;
