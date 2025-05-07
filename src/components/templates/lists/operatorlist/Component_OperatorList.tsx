'use client';

import { useEffect, useState } from 'react';

interface OperatorCount {
  idOperator?: number;
  name: string;
  description: string | null;
  codeoperador: string | null;
  codeantel: string | null;
}

export default function OperatorList() {
  const [operators, setOperators] = useState<OperatorCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<OperatorCount | null>(null);

  useEffect(() => {
    async function fetchOperators() {
      try {
        const response = await fetch('/api/stats/relative/listOperators');
        if (!response.ok) throw new Error('Erro ao buscar operadoras');
        const data: OperatorCount[] = await response.json();
        setOperators(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOperators();
  }, []);

  function handleEdit(index: number) {
    setEditIndex(index);
    setEditedRow({ ...operators[index] });
  }

  function handleChange(field: keyof OperatorCount, value: string) {
    if (!editedRow) return;
    setEditedRow({ ...editedRow, [field]: value });
  }

  async function handleSave(index: number) {
    if (!editedRow || editedRow.idOperator === undefined) {
      alert('ID do operador ausente');
      return;
    }
  
    console.log('Enviando atualização para:', editedRow);
  
    try {
      const response = await fetch(`/api/stats/relative/listOperators/editOperator/${editedRow.idOperator}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedRow),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do servidor:', errorData);
        throw new Error(errorData.error || 'Erro ao salvar alterações');
      }
  
      const updated = [...operators];
      updated[index] = editedRow;
      setOperators(updated);
      setEditIndex(null);
      setEditedRow(null);
      alert('Registro atualizado com sucesso!');
    } catch (err) {
      alert((err as Error).message);
    }
  }
  

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Operadoras</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm rounded-md">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Código Operadora</th>
              <th className="px-4 py-2 border">Código Anatel</th>
              <th className="px-4 py-2 border">Descrição</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op, index) => (
              <tr key={op.idOperator ?? index}>
                <td className="px-4 py-2 border">
                  {editIndex === index ? (
                    <input
                      value={editedRow?.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    op.name
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === index ? (
                    <input
                      value={editedRow?.codeoperador || ''}
                      onChange={(e) => handleChange('codeoperador', e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    op.codeoperador || 'N/A'
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === index ? (
                    <input
                      value={editedRow?.codeantel || ''}
                      onChange={(e) => handleChange('codeantel', e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    op.codeantel || 'N/A'
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === index ? (
                    <input
                      value={editedRow?.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    op.description || 'Sem descrição'
                  )}
                </td>                
                <td className="px-4 py-2 border">
                  {editIndex === index ? (
                    <button
                      onClick={() => handleSave(index)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Salvar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
