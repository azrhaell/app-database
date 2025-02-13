import { getJsonFiles } from '@/lib/listFiles';
import Home from './Home';

export default async function Page() {
  const files = await getJsonFiles(); // Busca os arquivos no servidor
  return <Home files={files} />; // Passa os arquivos para o componente Home
}
