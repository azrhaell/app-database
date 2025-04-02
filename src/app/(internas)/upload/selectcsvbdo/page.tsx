import CsvUploadForm from "@/components/templates/forms/upload/uploadFileFilterbdoCSV/Form_UploadFileFilterbdoCSV"
import Component_ListBDO from "@/components/templates/lists/listbdo/Component_ListBDO"
import { getBDFiles } from "@/lib/listBDFiles";

export interface FileType {
  name: string;
  path: string | null;
  qtdregisters: number | null;
  origin: string | null;
  created: Date;
  sincronized?: boolean; // 🔹 Indica se o arquivo já foi sincronizado
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
