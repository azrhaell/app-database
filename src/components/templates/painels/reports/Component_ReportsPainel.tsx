import Link from 'next/link'
import React from 'react'

const Component_ReportsPainel = () => {

  return (

    <div>
        <Link href={'/statistics/relative/listoperators'} className="hover:underline">
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
                Lista de Operadoras
            </button>
        </Link>

        <Link href={'/statistics/relative/listorganization/listpercentorganization'} className="hover:underline">
            <button type="button" className="text-white
                                                bg-yellow-700 
                                                hover:bg-yellow-800 
                                                focus:ring-4
                                                focus:ring-yellow-300
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-yellow-600 
                                                dark:hover:bg-yellow-700 
                                                focus:outline-none 
                                                dark:focus:ring-yellow-800">
                Gerar Relatório
            </button>
        </Link>

    </div>
  )
}

export default Component_ReportsPainel