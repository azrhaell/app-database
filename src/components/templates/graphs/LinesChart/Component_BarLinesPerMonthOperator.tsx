'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  month: string;
  operatorname: string;
  total_lines: number;
}

interface TransformedData {
  month: string;
  [operator: string]: number | string;
}

export default function Component_BarLinesByMonthOperatorChart() {
  const [data, setData] = useState<TransformedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stats/relative/listOperators/linesPerMonthOperator');
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const rawData: ChartData[] = await response.json();

        // Transformar dados para o formato adequado ao Recharts
        const groupedData: { [month: string]: TransformedData } = {};
        const uniqueOperators = new Set<string>();

        rawData.forEach(({ month, operatorname, total_lines }) => {
          if (!groupedData[month]) {
            groupedData[month] = { month };
          }
          groupedData[month][operatorname] = total_lines;
          uniqueOperators.add(operatorname);
        });

        setData(Object.values(groupedData));
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

  // Função para gerar uma cor aleatória
  const generateColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
//<Bar key={operator} dataKey={operator} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantidade de Linhas por Mês e Operadora</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="#8884d8" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {Array.from(new Set(data.flatMap(d => Object.keys(d)).filter(key => key !== 'month'))).map((operator, {/*index*/}) => (
              
              <Bar key={operator} dataKey={operator} fill={generateColor()} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
