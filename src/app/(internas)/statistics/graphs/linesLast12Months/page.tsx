import Component_LinesLast12Months from "@/components/templates/graphs/LinesChart/Component_LinesLast12Months";



export default function LinesStatsPage() {
  return (
    <div className='flex flex-col w-11/12 h-screen bg-white'>
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Estatísticas de Linhas - Últimos 12 Meses</h1>
      <Component_LinesLast12Months />
    </div>
  );
}
