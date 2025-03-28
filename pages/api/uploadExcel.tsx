import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import prisma from "@/app/api/database/dbclient";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "4gb", // Aumenta o limite da resposta
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const form = new IncomingForm({
    maxFileSize: 2 * 1024 * 1024 * 1024, // Até 2GB
    multiples: false,
    uploadDir: "./public/uploads",
    keepExtensions: true,
  });

  form.parse(req, async (err: Error, fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ error: `Erro no upload: ${err.message}` });

    try {
      if (!files.file || !files.file[0]) {
        return res.status(400).json({ error: "Arquivo não encontrado" });
      }

      const filePath = files.file[0].filepath;
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileExtension = path.extname(filePath).toLowerCase();
      const jsonPath = path.join(process.cwd(), `public/uploads/${fileName}.json`);
      const origin = "MAIN";

      if (!fs.existsSync(filePath)) {
        throw new Error("Arquivo não encontrado no servidor!");
      }

      const buffer = await fs.promises.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, dense: true });

      if (workbook.SheetNames.length === 0) {
        throw new Error("Nenhuma planilha encontrada no arquivo!");
      }

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      if (!sheet || Object.keys(sheet).length === 0) {
        throw new Error("Nenhuma planilha válida encontrada!");
      }

      const writeStream = fs.createWriteStream(jsonPath, { flags: "w" });
      writeStream.write("[\n");

      let rowCount = 0;
      interface ExcelRow {
        [key: string]: string | number | boolean | Date | null;
      }

      interface StreamResponse {
        message: string;
        count: number;
      }

      interface StreamError {
        error: string;
      }

      XLSX.stream.to_json(sheet, { raw: false, defval: null })
        .on("data", (row: ExcelRow) => {
          if (rowCount > 0) writeStream.write(",\n");
          writeStream.write(JSON.stringify(row));
          rowCount++;
        })
        .on("end", async () => {
          writeStream.write("\n]");
          writeStream.end();

          // Salvando no banco de dados
          await prisma.listfiles.create({
        data: {
          name: fileName,
          qtdregisters: rowCount,
          path: jsonPath,
          extension: fileExtension,
          origin: origin,
        },
          });

          res.status(200).json({ message: "Upload concluído!", count: rowCount } as StreamResponse);
        })
        .on("error", (error: Error) => {
          res.status(500).json({ error: "Erro ao processar arquivo: " + error.message } as StreamError);
        });
    } catch (error) {
      res.status(500).json({ error: "Erro ao processar arquivo: " + (error as Error).message });
    }
  });
}
