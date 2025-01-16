import { RepoExtractOptions, RepoExtractResult } from "../types";
import { DEFAULT_IGNORE_PATTERNS } from "../constants/patterns";
import { cloneRepository } from "./repository";
import { getFilteredFiles, processFiles } from "./files";
import {
  formatSize,
  formatTokens,
  generateTree,
  formatJson,
  formatMarkdown,
  formatPlainText,
} from "./formatter";
import { encode } from "gpt-tokenizer";
import fs from "fs/promises";
import { chunkContent } from "./chunk";

/**
 * Extracts repository content and provides both full and chunked output.
 * @param options - Configuration options for extraction.
 * @returns Repository content in both full and chunked formats, along with metadata.
 */
export async function extract(
  options: RepoExtractOptions,
): Promise<RepoExtractResult> {
  const {
    source,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    includePatterns = [],
    excludePatterns = [],
    output,
    format = "text",
    chunkSize = 4000, // Default chunk size for LLMs
  } = options;

  // Clone repository if source is a URL
  const workingDir =
    source.startsWith("http") || source.startsWith("git@")
      ? await cloneRepository(source)
      : source;

  // Get and filter files
  const allPatterns = [...DEFAULT_IGNORE_PATTERNS, ...(excludePatterns || [])];
  const allFiles = await getFilteredFiles(workingDir, [], []); // Get all files first
  const filteredFiles = await getFilteredFiles(
    workingDir,
    allPatterns,
    includePatterns,
  );

  // Process files
  const processedFiles = await processFiles(
    workingDir,
    filteredFiles,
    maxFileSize,
  );

  // Calculate statistics
  const stats = {
    filesFound: allFiles.length,
    filesExcluded: allFiles.length - filteredFiles.length,
    filesSkipped: filteredFiles.length - processedFiles.length,
    totalSize: processedFiles.reduce((acc, file) => acc + file.size, 0),
    totalTokens: encode(processedFiles.map((f) => f.content).join("\n")).length,
  };

  // Generate outputs
  const tree = generateTree(workingDir, filteredFiles);

  // Generate full content and chunks based on format
  let fullContent: string;
  let chunks: string[];

  if (format === "json") {
    fullContent = formatJson(processedFiles, tree, stats);
    chunks = [fullContent]; // For JSON, we don't actually chunk
  } else {
    fullContent =
      format === "markdown"
        ? formatMarkdown(processedFiles, tree)
        : formatPlainText(processedFiles);
    chunks = chunkContent(processedFiles, chunkSize, format);
  }

  const summary = [
    `Files found: ${stats.filesFound}`,
    `Files excluded by patterns: ${stats.filesExcluded}`,
    `Files skipped (size limit): ${stats.filesSkipped}`,
    `Files processed: ${processedFiles.length}`,
    `Total size: ${formatSize(stats.totalSize)}`,
    `Estimated tokens: ${formatTokens(stats.totalTokens)}`,
  ].join("\n");

  // Write output to file if specified
  const outputPath =
    output === true ? "output.txt" : output ? output.toString() : null;

  if (outputPath) {
    if (format === "json") {
      await fs.writeFile(outputPath, fullContent);
    } else {
      const outputContent = chunks.join("\n\n--- CHUNK ---\n\n");
      await fs.writeFile(
        outputPath,
        format === "markdown" ? outputContent : `${tree}\n\n${outputContent}`,
      );
    }
  }
  return {
    summary,
    tree,
    fullContent, // Full repository content as a single string
    chunks, // Repository content split into chunks
    stats,
    tokens: stats.totalTokens,
  };
}
