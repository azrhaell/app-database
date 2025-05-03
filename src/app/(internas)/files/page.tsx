import Component_ListUploadedFiles from "@/components/templates/lists/listuploadedfiles/Component_ListUploadedFiles"

const page = () => {
  return (
    <div className="flex flex-col justify-center w-11/12 h-screen items-center
        bg-gray-600">
          <Component_ListUploadedFiles />
        </div>
  )
}

export default page