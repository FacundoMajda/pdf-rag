import { createOpenAI } from "@ai-sdk/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateText } from "ai";
import { fileURLToPath } from "url";
import path from "path";

console.log("🚀 Procesamiento de PDF...");

const endpoint = "https://models.inference.ai.azure.com";
const openai = createOpenAI({
  baseURL: endpoint,
  apiKey: "tu_api_key",
});
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "docs", "nombre-de-documento.pdf");

const loader = new PDFLoader(pdfPath, {
  parsedItemSeparator: "",
  includeMetadata: true,
});

const docs = await loader.load();
console.log(`📄 PDF cargado: ${docs.length} página(s)`);

const docInfo = {
  title: docs[0]?.metadata?.pdf?.info?.Title || "Documento",
  pages: docs[0]?.metadata?.pdf?.totalPages || "?",
};
console.log(`📊 Metadata obtenida: "${docInfo.title}" (${docInfo.pages} págs)`);

const chunks = await new RecursiveCharacterTextSplitter({
  chunkSize: 1500,
  chunkOverlap: 200,
}).splitDocuments(docs);
console.log(`✂️ Documento dividido en ${chunks.length} fragmentos`);

const context = chunks
  .map(
    (chunk) => `[Pág. ${chunk.metadata.loc.pageNumber}]\n${chunk.pageContent}`
  )
  .join("\n\n");
console.log(`🧩 Contexto creado con ${chunks.length} fragmentos`);

console.log(`🤖 Enviando consulta al Llm...`);
const { text } = await generateText({
  model: openai("gpt-4o-mini"),
  messages: [
    {
      role: "system",
      content: `Eres un asistente experto en análisis documental. Estás analizando un documento de ${docInfo.pages} páginas titulado "${docInfo.title}".
      Instrucciones:
      - Utiliza exclusivamente la información proporcionada en los extractos del documento para responder.
      - Si la información solicitada no está presente en los extractos, indica claramente "No puedo responder a esta pregunta con los extractos proporcionados".
      - Presenta la información de manera estructurada utilizando puntos clave cuando sea apropiado.
      - Mantén un tono profesional y objetivo en tus análisis.
      - Cuando cites información específica, indica la página de origen si está disponible.`,
    },
    {
      role: "user",
      content: `De que se trata este documento?: Texto extraido del documento:\n\n${context}\n\n`,
    },
  ],
});
console.log(`✅ Respuesta recibida correctamente\n`);

console.log(`💬 RESULTADO:\n${text}`);
