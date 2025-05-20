import Link from 'next/link'
import React from 'react'

const Component_DataPainel = () => {
  return (
    <>

    <div>
        <Link href="/statistics/lists" className="hover:underline">
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
                                Listagens
                            </button>
        </Link>
        <Link href="/statistics/reports/reportpainel/" className="hover:underline">
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
                                Relatórios
                            </button>
        </Link>
        <Link href="/statistics/graphs" className="hover:underline">
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
                                Gráficos
                            </button>
        </Link>
        <Link href="/search/singlecnpj" className="hover:underline">
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
                                Pesquisar
                            </button>
        </Link>
    </div>


    </>
    
  )
}

export default Component_DataPainel