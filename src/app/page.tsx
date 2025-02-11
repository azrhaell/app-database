import DownloadLink from "@/components/templates/forms/telein/Form_Telein";
import Form_UploadExcel from "@/components/templates/forms/upload/uploadform/Form_UploadExcel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center
                   bg-gray-600">
      
      <Form_UploadExcel />
      {/*<DownloadLink />*/}
    
    </div>
  );
}
