const Component_Main = ({children,}: Readonly<{children: React.ReactNode;}>) => {
    return (
      <>
        <main className="flex flex-row w-screen">

            {/*Navbar*/}
            
            {children}
            
        </main>
      </>
    )
  }
  
  export default Component_Main