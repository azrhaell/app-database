import UploadFilterbrfCSV from "@/components/templates/forms/upload/uploadFileFilterbrfCSV/Form_UploadFileFilterbrfCSV"
import Component_ListBRF from "@/components/templates/lists/listbrf/Component_ListBRF";
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
    
    <div className="flex flex-col justify-center w-11/12 h-screen items-center bg-gray-600">
      <UploadFilterbrfCSV />
      <Component_ListBRF files={{ fileNames: files.fileNames || [] }} />;

    </div>

  )
}

export default Page