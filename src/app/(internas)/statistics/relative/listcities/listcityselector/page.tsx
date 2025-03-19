import Component_CitySelector from "@/components/templates/lists/citieslist/operatorpercity/Component_CitySelector"

const states = ['SP', 'RJ', 'MG', 'ES']; // Substitua pela sua lista de estados

const page = () => {
  return (

    <div className='flex flex-col w-11/12 h-screen bg-gray-600'>
        
        <h1>Seletor de Cidades</h1>

        <Component_CitySelector states={states}  />
        
    </div>
  )
}

export default page