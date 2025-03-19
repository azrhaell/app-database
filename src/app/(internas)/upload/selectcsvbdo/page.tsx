import CsvUploadForm from "@/components/templates/forms/upload/uploadFileFilterbdoCSV/Form_UploadFileFilterbdoCSV"
import Component_ListBDO from "@/components/templates/lists/listbdo/Component_ListBDO"
import { getBDFiles } from "@/lib/listBDFiles";

export interface FileType {
  name: string;
  path: string | null;
  recordCount: number | null;
  origin: string | null;
  createdAt: Date;
}

const Page = async () => {
  const files = await getBDFiles();
  return (
    
    <div className="
                    flex flex-col justify-center w-11/12 h-screen items-center bg-gray-600"
                    >
      <CsvUploadForm />
      <Component_ListBDO files={{ fileNames: files.fileNames || [] }} />;

    </div>

  )
}

export default Page
