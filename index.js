import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(__dirname, "docs", "Ejercicios.pdf");

const loader = new PDFLoader(pdfPath, {
  parsedItemSeparator: "",
});

const document = await loader.load();

console.log(document[0].pageContent);
