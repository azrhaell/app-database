const Component_Main = ({children,}: Readonly<{children: React.ReactNode;}>) => {
    return (
      <>
        <main className="flex flex-row px-1 w-screen">

            {children}
            
        </main>
      </>
    )
  }
  
  export default Component_Main