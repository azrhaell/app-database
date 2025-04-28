'use client';
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
    <div>
      <h2>Configurações</h2>
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
  );
};

export default Component_ConfigPanel;
