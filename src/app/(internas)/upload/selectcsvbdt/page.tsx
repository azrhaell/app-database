import UploadFileThirdPartyBaseCSV from "@/components/templates/forms/upload/uploadFileThirdPartyBaseCSV/Form_UploadFileThirdPartyBaseCSV"
import Component_ListBDT from "@/components/templates/lists/listbdt/Component_ListBDT";
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
    
    <div className="flex flex-col justify-center w-11/12 h-screen items-center
    bg-gray-600">

      <UploadFileThirdPartyBaseCSV />
      <Component_ListBDT files={{ fileNames: files.fileNames || [] }} />;

    </div>

  )
}

export default Page