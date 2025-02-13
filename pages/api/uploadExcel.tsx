import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";

export const config = {
  api: { bodyParser: false },
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
      const fileName = path.basename(filePath, path.extname(filePath)); // Obtém o nome do arquivo sem a extensão
      const jsonPath = path.join(process.cwd(), `public/uploads/${fileName}.json`);

      console.log("📥 Lendo arquivo Excel...");

      if (!fs.existsSync(filePath)) {
        throw new Error("Arquivo não encontrado no servidor!");
      }

      const buffer = await fs.promises.readFile(filePath);

      console.log("✅ Arquivo carregado na memória, tentando processar...");

      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, dense: true });

      console.log(`📊 Planilhas encontradas: ${workbook.SheetNames.join(", ")}`);

      if (workbook.SheetNames.length === 0) {
        throw new Error("Nenhuma planilha encontrada no arquivo!");
      }

      let sheetName = workbook.SheetNames[0]; // Pega a primeira planilha
      let sheet = workbook.Sheets[sheetName];

      // 🔹 Se a planilha principal não for encontrada ou estiver vazia, procurar outra
      if (!sheet || Object.keys(sheet).length === 0) {
        console.warn(`⚠️ Planilha "${sheetName}" vazia. Procurando outra...`);
        for (const name of workbook.SheetNames) {
          const tempSheet = workbook.Sheets[name];
          if (tempSheet && Object.keys(tempSheet).length > 0) {
            sheetName = name;
            sheet = tempSheet;
            console.log(`✅ Planilha válida encontrada: ${sheetName}`);
            break;
          }
        }
      }

      if (!sheet || Object.keys(sheet).length === 0) {
        throw new Error("Nenhuma planilha válida encontrada no arquivo!");
      }

      console.log(`✅ Processando planilha: ${sheetName}`);

      // 🔹 Depuração: Mostrar os primeiros 5 registros
      const testData = XLSX.utils.sheet_to_json(sheet, { raw: false, range: 0, header: 1, sheetRows: 5 });
      console.log("🔎 Exemplo de dados extraídos:", testData);

      // 🔹 Criando o stream para salvar JSON
      const writeStream = fs.createWriteStream(jsonPath, { flags: "w" });
      writeStream.write("[\n");

      // 🔹 Lendo em chunks para evitar travamento com arquivos grandes
      let rowCount = 0;
      interface ExcelRow {
        [key: string]: string | number | boolean | null;
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

                if (rowCount % 100_000 === 0) {
                  console.log(`✅ Processados: ${rowCount} registros...`);
                }
              })
              .on("end", () => {
                writeStream.write("\n]");
                writeStream.end();
                console.log(`✅ Processamento finalizado: ${rowCount} registros salvos.`);
                res.status(200).json({ message: "Upload concluído!", count: rowCount } as StreamResponse);
              })
              .on("error", (error: Error) => {
                console.error("❌ Erro ao processar planilha:", error);
                res.status(500).json({ error: "Erro ao processar arquivo: " + error.message } as StreamError);
              });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao processar arquivo: " + (error as Error).message });
    }
  });
}
