import { RepoExtractOptions, RepoExtractResult } from "../types";
import { DEFAULT_IGNORE_PATTERNS } from "../constants/patterns";
import { cloneRepository } from "./repository";
import { getFilteredFiles, processFiles } from "./files";
import {
  formatSize,
  formatTokens,
  generateTree,
  formatJson,
  formatPlainText,
  formatMarkdown,
} from "./formatter";
import { encode } from "gpt-tokenizer";
import fs from "fs/promises";

export async function extract(
  options: RepoExtractOptions
): Promise<RepoExtractResult> {
  console.log("Debug - options:", options);
  const {
    source,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    includePatterns = [],
    excludePatterns = [],
    output,
    format = "text",
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
    includePatterns
  );

  // Process files
  const processedFiles = await processFiles(
    workingDir,
    filteredFiles,
    maxFileSize
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
  console.log("Debug - files found:", filteredFiles.length);
  console.log("Debug - processed files:", processedFiles.length);
  console.log("Debug - format:", format);

  let content: string;
  switch (format) {
    case "json":
      content = formatJson(processedFiles, tree, stats);
      break;
    case "markdown":
      content = formatMarkdown(processedFiles, tree);
      break;
    default:
      content = formatPlainText(processedFiles);
  }

  const summary = [
    `Files found: ${stats.filesFound}`,
    `Files excluded by patterns: ${stats.filesExcluded}`,
    `Files skipped (size limit): ${stats.filesSkipped}`,
    `Files processed: ${processedFiles.length}`,
    `Total size: ${formatSize(stats.totalSize)}`,
    `Estimated tokens: ${formatTokens(stats.totalTokens)}`,
  ].join("\n");

  const outputPath =
    output === true ? "output.txt" : output ? output.toString() : null;

  if (outputPath) {
    format === "json" || format === "markdown"
      ? await fs.writeFile(outputPath, content)
      : await fs.writeFile(outputPath, `${tree}\n\n${content}`);
  }

  return { summary, tree, content, stats };
}
