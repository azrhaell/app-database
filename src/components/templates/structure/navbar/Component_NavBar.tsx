import Link from "next/link"

const NavBar = () => {
  return (
            <nav className="flex flex-col p-2 w-1/12 bg-blue-300">

                <h1>Menu</h1>
                <ul className="flex flex-col gap-2">

                    <li>
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                    </li>
                    <li className="hover:bg-green-400">
                        <Link href="/upload/selectmainbdpage" className="hover:underline">
                            Upload CSV p/ Cadastro
                        </Link>
                    </li>
                    <li className="hover:bg-blue-400">
                        <Link href="/upload/selectbdpage" className="hover:underline">
                            Upload CSV Bases Externas
                        </Link>
                    </li>
                    <li className="hover:bg-blue-400">
                        <Link href="/statistics/database/selectintegrations" className="hover:underline">
                            Integração de Bases
                        </Link>
                    </li>
                    <li className="hover:bg-gray-400">
                        <Link href="/reports" className="hover:underline">
                            Relatórios
                        </Link>
                    </li>
                    <li className="hover:bg-gray-400">
                        <Link href="/statistics" className="hover:underline">
                            Gráficos
                        </Link>
                    </li>
                    <li className="hover:bg-red-400">
                        <Link href="/download/filetelein" className="hover:underline">
                            Download Tele IN
                        </Link>
                    </li>
                    <li className="hover:bg-gray-400">
                        <Link href="/configs" className="hover:underline">
                            Administração
                        </Link>
                    </li>
                </ul>

            </nav>
  )
}

export default NavBar