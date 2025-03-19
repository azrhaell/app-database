import { getJsonFiles } from '@/lib/listFiles';
import Home from './Home';

export interface FileType {
  name: string;
  recordCount: number | null;
  origin: string | null;
  createdAt: Date;
}


export default async function Page() {
  const files = await getJsonFiles(); // Busca os arquivos no servidor
  return <Home files={{ fileNames: files.fileNames || [] }} />; // Passa os arquivos para o componente Home
}
