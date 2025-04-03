import UploadFileMailingBaseCSV from "@/components/templates/forms/upload/uploadFileMailingBaseCSV/Form_UploadFileMailingBaseCSV"
import Component_ListBDMailing from "@/components/templates/lists/listbdmailing/Component_ListBDMailing";
import { getBDFiles } from "@/lib/listBDFiles";

export interface FileType {
  name: string;
  path: string | null;
  qtdregisters: number | null;
  origin: string | null;
  created: Date;
}

const Page = async () => {
  const files = await getBDFiles();
  return (
    
    <div className="flex flex-col justify-center w-11/12 h-screen items-center
    bg-gray-600">

      <UploadFileMailingBaseCSV />
      <Component_ListBDMailing files={{ fileNames: files.fileNames || [] }} />;

    </div>

  )
}

export default Page