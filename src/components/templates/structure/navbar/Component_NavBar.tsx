import Link from "next/link"

const NavBar = () => {
  return (
            <nav>

                <ul className="flex flex-col gap-2">

                    <li>
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                    </li>
                    
                </ul>

            </nav>
  )
}

export default NavBar