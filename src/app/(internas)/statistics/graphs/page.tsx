import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col w-11/12 h-screen bg-gray-600">
        <Link href="/statistics/graphs/generalstatistics" className="hover:underline">
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
                          Estatísticas Gerais
                      </button>
          </Link>
    </div>
  )
}

export default page