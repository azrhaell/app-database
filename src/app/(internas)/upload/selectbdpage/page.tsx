import Link from "next/link"

const page = () => {
  return (
    
    <div className="flex flex-col justify-center w-11/12 h-screen items-center
    bg-gray-600">

        <Link href="/upload/selectcsvbdo" className="hover:underline">
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
                Importar BDO
            </button>
        </Link>

        <Link href="/upload/selectcsvbrf" className="hover:underline">
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
                    Importar BRF
                </button>
        </Link>

{/*
        <Link href="/upload/selectcsvbdt" className="hover:underline">
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
                Importar BDT
            </button>
        </Link>
        
        <Link href="/upload/selectcsvbdmailing" className="hover:underline">
            <button type="button" className="text-white
                                                bg-orange-700 
                                                hover:bg-orange-800 
                                                focus:ring-4
                                                focus:ring-orange-300
                                                font-medium
                                                rounded-lg
                                                text-sm 
                                                px-5 
                                                py-2.5 
                                                me-2 
                                                mb-2 
                                                dark:bg-orange-600 
                                                dark:hover:bg-orange-700 
                                                focus:outline-none 
                                                dark:focus:ring-orange-800">
                    Importar BD Mailing
                </button>
        </Link>
*/}
    </div>

  )
}

export default page