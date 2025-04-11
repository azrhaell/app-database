import Link from 'next/link'
import React from 'react'

const Component_StatisticsPainel = () => {

  return (

    <div>
        <Link href={'/statistics/database'} className="hover:underline">
            <button type="button" className="text-white
                                                bg-red-700 
                                                hover:bg-red-800 
                                                focus:ring-4
                                                focus:ring-red-300
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-red-600 
                                                dark:hover:bg-red-700 
                                                focus:outline-none 
                                                dark:focus:ring-red-800">
                Estatísticas da Base de Dados
            </button>
        </Link>

        <Link href={'/statistics/relative/listoperators/graphs/linesLast12Months'} className="hover:underline">
            <button type="button" className="text-white
                                                bg-green-700 
                                                hover:bg-green-800 
                                                focus:ring-4
                                                focus:ring-green-300
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-green-600 
                                                dark:hover:bg-green-700 
                                                focus:outline-none 
                                                dark:focus:ring-green-800">
                Gráfico de Linhas dos Últimos 12 Meses
            </button>
        </Link>
        <Link href={'/statistics/relative/listoperators/graphs/linesPerMonthOperator'} className="hover:underline">
            <button type="button" className="text-white
                                                bg-blue-700 
                                                hover:bg-blue-800 
                                                focus:ring-4
                                                focus:ring-blue-300
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-blue-600 
                                                dark:hover:bg-blue-700 
                                                focus:outline-none 
                                                dark:focus:ring-blue-800">
                Gráfico de Linhas Por Operadora
            </button>
        </Link>

        <Link href={'/statistics/relative/listcities/listcityselector'} className="hover:underline">
            <button type="button" className="text-white
                                                bg-red-500 
                                                hover:bg-red-600 
                                                focus:ring-4
                                                focus:ring-red-100
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-red-400 
                                                dark:hover:bg-red-500 
                                                focus:outline-none 
                                                dark:focus:ring-red-600">
                Estatísticas por Região
            </button>
        </Link>

    </div>
  )
}

export default Component_StatisticsPainel