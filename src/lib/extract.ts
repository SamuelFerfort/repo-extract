import { RepoExtractOptions, RepoExtractResult } from "../types";
import { DEFAULT_IGNORE_PATTERNS } from "../constants/patterns";
import { cloneRepository } from "./repository";
import { getFilteredFiles, processFiles } from "./files";
import {
  formatSize,
  formatTokens,
  generateTree,
  formatContent,
} from "./formatter";
import { encode } from "gpt-tokenizer";
import fs from "fs/promises";

export async function extract(
  options: RepoExtractOptions
): Promise<RepoExtractResult> {
  const {
    source,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    includePatterns = [],
    excludePatterns = [],
    output,
  } = options;

  // Clone repository if source is a URL
  const workingDir =
    source.startsWith("http") || source.startsWith("git@")
      ? await cloneRepository(source)
      : source;

  // Get and filter files
  const allPatterns = [...DEFAULT_IGNORE_PATTERNS, ...(excludePatterns || [])];
  const files = await getFilteredFiles(
    workingDir,
    allPatterns,
    includePatterns
  );

  // Process files
  const processedFiles = await processFiles(workingDir, files, maxFileSize);

  // Generate outputs
  const tree = generateTree(workingDir, files);
  const content = formatContent(processedFiles);

  // Calculate statistics
  const totalFiles = processedFiles.length;
  const totalSize = processedFiles.reduce((acc, file) => acc + file.size, 0);
  const tokens = encode(content).length;

  const summary = [
    `Files analyzed: ${totalFiles}`,
    `Total size: ${formatSize(totalSize)}`,
    `Estimated tokens: ${formatTokens(tokens)}`,
  ].join("\n");

  const outputPath =
    output === true ? "output.txt" : output ? output.toString() : null;

  if (outputPath) {
    await fs.writeFile(outputPath, `${tree}\n\n${content}`);
  }

  return { summary, tree, content };
}
