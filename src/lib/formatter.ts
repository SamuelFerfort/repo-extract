import { ExtractedFile } from "../types";
import path from "path";

export function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)}${units[unitIndex]}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return tokens.toString();
}

export function generateTree(baseDir: string, files: string[]): string {
  const tree = ["Directory structure:"];
  const prefix = "└── ";

  files.forEach((file) => {
    const relativePath = path.relative(baseDir, file);
    tree.push(`${prefix}${relativePath}`);
  });

  return tree.join("\n");
}

export function formatContent(files: ExtractedFile[]): string {
  return files
    .map((file) => `File: ${file.path}\n${"=".repeat(48)}\n${file.content}\n`)
    .join("\n");
}
