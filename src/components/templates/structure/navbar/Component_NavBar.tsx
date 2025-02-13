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
                    <li>
                        <Link href="/list" className="hover:underline">
                            Lista
                        </Link>
                    </li>
                    <li>
                        <Link href="/upload/fileexcel" className="hover:underline">
                            Upload Excel
                        </Link>
                    </li>
                    <li>
                        <Link href="/upload/filecsv" className="hover:underline">
                            Upload CSV
                        </Link>
                    </li>
                    <li>
                        <Link href="/download/filetelein" className="hover:underline">
                            Download Tele IN
                        </Link>
                    </li>
                    
                </ul>

            </nav>
  )
}

export default NavBar