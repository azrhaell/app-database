import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import csv from "csv-parser";

export const config = {
  api: {
    bodyParser: false, // Importante para permitir upload de arquivos
  },
};

interface RowData {
  [key: string]: string | number | boolean | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const form = new IncomingForm({
    maxFileSize: 2000 * 1024 * 1024, // Aumenta o limite para 2GB
    maxTotalFileSize: 2000 * 1024 * 1024, // Limite total de 2GB
    multiples: false, // Apenas 1 arquivo por vez
    uploadDir: "./public/uploads", // Define um diretório temporário
    keepExtensions: true,
  });

  form.parse(req, async (err: Error, fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ error: `Erro no upload: ${err.message}` });

    try {
      if (!files.file || !files.file[0]) {
        return res.status(400).json({ error: "Arquivo não encontrado" });
      }

      const filePath = files.file[0].filepath;
      const jsonPath = path.join(process.cwd(), "public/uploads/data.json");
      const writeStream = fs.createWriteStream(jsonPath, { flags: "w" });

      writeStream.write("[\n");

      let firstRow = true;
      let rowCount = 0;
      const maxRows = 5_000_000; // Limite máximo de registros a processar

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row: RowData) => {
          if (rowCount >= maxRows) return;

          if (!firstRow) {
            writeStream.write(",\n");
          }
          writeStream.write(JSON.stringify(row));
          firstRow = false;
          rowCount++;

          if (rowCount % 100_000 === 0) {
            console.log(`Processados: ${rowCount} registros...`);
          }
        })
        .on("end", () => {
          writeStream.write("\n]");
          writeStream.end();

          res.status(200).json({
            message: "Upload concluído!",
            count: rowCount,
          });
        })
        .on("error", (error) => {
          console.error(error);
          res.status(500).json({ error: "Erro ao processar arquivo: " + error.message });
        });
    } catch (error) {
      console.error(error);
      const err = error as Error;
      res.status(500).json({ error: "Erro ao processar arquivo: " + err.message });
    }
  });
}
