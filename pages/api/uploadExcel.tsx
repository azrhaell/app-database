import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";

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
    maxFileSize: 2000 * 1024 * 1024, // Aumenta o limite para 1GB
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
      const workbook = new ExcelJS.Workbook();
      const stream = fs.createReadStream(filePath);
      await workbook.xlsx.read(stream);

      const worksheet = workbook.worksheets[0];

      const jsonPath = path.join(process.cwd(), "public/uploads/data.json");
      const writeStream = fs.createWriteStream(jsonPath, { flags: "w" });

      writeStream.write("[\n");

      let firstRow = true;
      let rowCount = 0;
      const maxRows = 5_000_000; // Limite máximo de registros a processar

      //worksheet.eachRow((row: ExcelJS.Row) => {
        for (let i = 1; i <= worksheet.rowCount; i++) {
          if (rowCount >= maxRows) break;
  
          const row = worksheet.getRow(i);
          const rowData: RowData = {};
  
          row.eachCell((cell, colNumber) => {
            const cellValue = cell.value;
            if (cellValue instanceof Date) {
              rowData[`Campo${colNumber}`] = cellValue.toISOString();
            } else if (typeof cellValue === 'object' && cellValue !== null) {
              rowData[`Campo${colNumber}`] = JSON.stringify(cellValue);
            } else {
              rowData[`Campo${colNumber}`] = cellValue ?? null;
            }
          });
  
          if (!firstRow) {
            writeStream.write(",\n");
          }
          writeStream.write(JSON.stringify(rowData));
          firstRow = false;
          rowCount++;
          
          if (rowCount % 100_000 === 0) {
            console.log(`Processados: ${rowCount} registros...`);
          }
        }

        writeStream.write("\n]");
        writeStream.end();
  
        res.status(200).json({
          message: "Upload concluído!",
          count: rowCount,
        });
      } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({ error: "Erro ao processar arquivo: " + err.message });
      }
    });
}