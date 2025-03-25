import { getJsonFiles } from '@/lib/listFiles';
import Home from './Home';

export interface FileType {
  name: string;
  recordCount: number | null;
  origin: string | null;
  createdAt: Date;
}

export default async function Page() {
  const files = await getJsonFiles(); // Busca inicial do lado do servidor
  return <Home initialFiles={{ fileNames: files.fileNames || [] }} />;
}
