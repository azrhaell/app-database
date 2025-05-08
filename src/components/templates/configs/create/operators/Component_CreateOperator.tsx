'use client';

import { useState } from 'react';

export default function CreateOperatorForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    codeoperador: '',
    codeantel: '',
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const res = await fetch('/api/config/create/operators/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus('Operador criado com sucesso.');
      setFormData({ name: '', description: '', codeoperador: '', codeantel: '' });
    } else {
      setStatus(data.error || 'Erro ao criar operador.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium">Nome *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Código Operadora</label>
        <input
          name="codeoperador"
          value={formData.codeoperador}
          onChange={handleChange}
          maxLength={2}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Código Anatel</label>
        <input
          name="codeantel"
          value={formData.codeantel}
          onChange={handleChange}
          maxLength={2}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Criar Operadora
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </form>
  );
}
