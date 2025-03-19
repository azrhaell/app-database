"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartData {
  month: string;
  total_lines: number;
}

const COLORS = [
  "#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#22c55e", "#6366f1",
  "#d946ef", "#eab308"
];

export default function LinesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/stats/relative/listOperators/linesLast12Months");
        if (!response.ok) throw new Error("Erro ao buscar dados do gráfico");

        const result: ChartData[] = await response.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Quantidade de Linhas por Mês</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_lines" radius={[5, 5, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
