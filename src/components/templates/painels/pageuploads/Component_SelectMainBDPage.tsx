import Link from 'next/link'
import React from 'react'

const Component_SelectMainBDPage = () => {
  return (
    <>
        <div>
            <Link href="/upload/filecsv" className="hover:underline">
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
                        Importar CSV
                    </button>
            </Link>

            <Link href="/upload/filecsvvivo" className="hover:underline">
                <button type="button" className="text-white
                                                    bg-purple-700 
                                                    hover:bg-purple-800 
                                                    focus:ring-4
                                                    focus:ring-purple-300
                                                    font-medium
                                                    rounded-lg
                                                    text-sm 
                                                    px-5 
                                                    py-2.5 
                                                    me-2 
                                                    mb-2 
                                                    dark:bg-purple-600 
                                                    dark:hover:bg-purple-700 
                                                    focus:outline-none 
                                                    dark:focus:ring-purple-800">
                        Importar CSV Vivo
                    </button>
            </Link>
        </div>        

        <div className="mt-4">
            <Link href="/listinput" className="hover:underline">
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
                    Inputar CSV p/ Base de Dados
                </button>
            </Link>
        </div>

    </>
  )
}

export default Component_SelectMainBDPage