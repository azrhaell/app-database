import Link from 'next/link'
import React from 'react'

const Component_SelectMainBDPage = () => {
  return (
    <>
        <Link href="/upload/fileexcel" className="hover:underline">
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
                Importar Excel
            </button>
        </Link>

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
    </>
  )
}

export default Component_SelectMainBDPage