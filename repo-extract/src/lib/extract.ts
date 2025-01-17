import { RepoExtractOptions, RepoExtractResult } from "../types";
import { DEFAULT_IGNORE_PATTERNS } from "../constants/patterns";
import { cloneRepository, FileEntry } from "./repository";
import { getFilteredFiles, processFiles } from "./files";
import { minimatch } from "minimatch";
import { ExtractedFile } from "../types";
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

export async function extract(
  options: RepoExtractOptions,
): Promise<RepoExtractResult> {
  const {
    source,
    maxFileSize = 10 * 1024 * 1024,
    includePatterns = [],
    excludePatterns = [],
    output,
    format = "text",
    chunkSize = 4000,
  } = options;

  // Clone repository or get files
  const result =
    source.startsWith("http") || source.startsWith("git@")
      ? await cloneRepository(source)
      : source;

  let processedFiles: ExtractedFile[];
  let allFilesCount: number;

  if (Array.isArray(result)) {
    // Handle array of files (from Vercel environment)
    const filtered = result.filter((file) => {
      if (file.size > maxFileSize) return false;
      const include =
        includePatterns.length === 0 ||
        includePatterns.some((pattern) => minimatch(file.path, pattern));
      const exclude = excludePatterns.some((pattern) =>
        minimatch(file.path, pattern),
      );
      return include && !exclude;
    });

    processedFiles = filtered.map((file) => ({
      path: file.path,
      content: file.content,
      size: file.size,
    }));
    allFilesCount = result.length;
  } else {
    // Handle directory path (local development)
    const allPatterns = [
      ...DEFAULT_IGNORE_PATTERNS,
      ...(excludePatterns || []),
    ];
    const allFiles = await getFilteredFiles(result, [], []);
    const filteredFiles = await getFilteredFiles(
      result,
      allPatterns,
      includePatterns,
    );
    processedFiles = await processFiles(result, filteredFiles, maxFileSize);
    allFilesCount = allFiles.length;
  }

  // Calculate statistics
  const stats = {
    filesFound: allFilesCount,
    filesExcluded: allFilesCount - processedFiles.length,
    filesSkipped: 0, // We're handling size limits in filtering now
    totalSize: processedFiles.reduce((acc, file) => acc + file.size, 0),
    totalTokens: encode(processedFiles.map((f) => f.content).join("\n")).length,
  };

  // Generate tree visualization
  const tree = Array.isArray(result)
    ? [
        "Directory structure:",
        ...processedFiles.map((f) => `└── ${f.path}`),
      ].join("\n")
    : generateTree(
        result,
        processedFiles.map((f) => f.path),
      );

  // Generate full content and chunks based on format
  let fullContent: string;
  let chunks: string[];

  if (format === "json") {
    fullContent = formatJson(processedFiles, tree, stats);
    chunks = [fullContent];
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
  if (output) {
    const outputPath = output === true ? "output.txt" : output.toString();
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
    fullContent,
    chunks,
    stats,
    tokens: stats.totalTokens,
  };
}
