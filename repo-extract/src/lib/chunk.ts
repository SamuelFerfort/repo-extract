import { encode } from "gpt-tokenizer";
import { ExtractedFile } from "../types";
import { formatJson, formatMarkdown, formatPlainText } from "./formatter";

/**
 * Splits files into chunks based on token size.
 * @param files - Array of extracted files.
 * @param chunkSize - Maximum token size for each chunk.
 * @param format - Output format for the chunks.
 * @returns Array of chunks in the specified format.
 */
export function chunkContent(
  files: ExtractedFile[],
  chunkSize: number,
  format: "text" | "json" | "markdown"
): string[] {
  const chunks: string[] = [];
  let currentChunk: ExtractedFile[] = [];
  let currentTokenCount = 0;

  for (const file of files) {
    const fileTokens = encode(file.content).length;

    // Skip files that are too large to fit into a single chunk
    if (fileTokens > chunkSize) {
      console.warn(`Skipping file ${file.path} (exceeds chunk size)`);
      continue;
    }

    if (currentTokenCount + fileTokens > chunkSize) {
      // Save the current chunk and start a new one
      chunks.push(formatChunk(currentChunk, format));
      currentChunk = [];
      currentTokenCount = 0;
    }

    currentChunk.push(file);
    currentTokenCount += fileTokens;
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push(formatChunk(currentChunk, format));
  }

  return chunks;
}

/**
 * Formats a chunk of files into the specified format.
 * @param files - Array of extracted files.
 * @param format - Output format for the chunk.
 * @returns Formatted chunk as a string.
 */
function formatChunk(
  files: ExtractedFile[],
  format: "text" | "json" | "markdown"
): string {
  switch (format) {
    case "json":
      return formatJson(files, "", { filesFound: files.length });
    case "markdown":
      return formatMarkdown(files, "");
    default:
      return formatPlainText(files);
  }
}