import fs from 'fs';
import path from 'path';
import readline from 'readline';

export async function getJsonFiles() {
  const directoryPath = path.join(process.cwd(), 'public/uploads');
interface FileData {
    name: string;
    createdAt: string;
    recordCount: number;
}
let filesData: FileData[] = [];

  try {
    const files = fs.readdirSync(directoryPath);

    filesData = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(directoryPath, file);
          const stats = fs.statSync(filePath);
          
          let recordCount = 0;

          try {
            const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
            const rl = readline.createInterface({ input: fileStream });

            for await (const line of rl) {
              const matches = line.match(/\{.*?\}/g); // Pega objetos JSON
              if (matches) {
                recordCount += matches.length;
              }
            }
          } catch (error) {
            console.error(`Erro ao processar o arquivo ${file}:`, error);
          }

          return {
            name: file,
            createdAt: stats.birthtime.toISOString(),
            recordCount
          };
        })
    );
  } catch (error) {
    console.error('Erro ao ler os arquivos:', error);
  }

  return filesData;
}
