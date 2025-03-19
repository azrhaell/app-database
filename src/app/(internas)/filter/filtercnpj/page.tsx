import FilterOrganizations from "@/components/templates/lists/listfilterorganizations/Component_FilterOrganizations"

//http://localhost:3000/filter/filtercnpj

const page = () => {
  return (
    <div className="flex flex-col justify-center w-11/12 h-screen items-center
        bg-gray-600">
          <FilterOrganizations />
        </div>
  )
}

export default page