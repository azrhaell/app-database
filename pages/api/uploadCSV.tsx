import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import csv from "csv-parser";
import prisma from "@/app/api/database/dbclient";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface RowData {
  [key: string]: string | number | boolean | null | undefined;
}

const detectDelimiter = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });

    stream.once("data", (chunk) => {
      const firstLine = chunk.toString("utf8").split("\n")[0];
      resolve(firstLine.includes(";") ? ";" : ",");
      stream.destroy();
    });

    stream.on("error", (error) => reject(error));
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const form = new IncomingForm({
    maxFileSize: 2000 * 1024 * 1024,
    maxTotalFileSize: 2000 * 1024 * 1024,
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

      const file = files.file[0];
      const filePath = file.filepath;
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileExtension = path.extname(file.originalFilename || "").toLowerCase();
      const jsonPath = path.join(process.cwd(), `public/uploads/${fileName}.json`);

      const writeStream = fs.createWriteStream(jsonPath, { flags: "w" });
      writeStream.write("[\n");

      let firstRow = true;
      let rowCount = 0;
      const maxRows = 50_000_000;
      const delimiter = await detectDelimiter(filePath);

      fs.createReadStream(filePath)
        .pipe(csv({ separator: delimiter }))
        .on("data", (row: RowData) => {
          if (rowCount >= maxRows) return;

          if (Object.keys(row).length > 0) { // Only write if the row has at least one key
            if (!firstRow) {
              writeStream.write(",\n");
            }
            writeStream.write(JSON.stringify(row));
            firstRow = false;
            rowCount++;
          }

          if (rowCount % 100_000 === 0) {
            console.log(`Processados: ${rowCount} registros...`);
          }
        })
        .on("end", async () => {
          writeStream.write("\n]");
          writeStream.end();

          await prisma.listfiles.create({
            data: {
              name: fileName,
              qtdregisters: rowCount,
              path: jsonPath,
              extension: fileExtension,
              origin: "MAIN",
            },
          });

          res.status(200).json({
            message: "Upload concluído!",
            count: rowCount,
            fileName,
            filePath: jsonPath,
            extension: fileExtension,
            origin: "MAIN",
          });
        })
        .on("error", (error) => {
          console.error(error);
          res.status(500).json({ error: "Erro ao processar arquivo: " + error.message });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao processar arquivo: " + (error as Error).message });
    }
  });
}