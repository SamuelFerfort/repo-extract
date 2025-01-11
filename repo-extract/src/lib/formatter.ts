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

export function formatPlainText(files: ExtractedFile[]): string {
  return files
    .map((file) => `File: ${file.path}\n${"=".repeat(48)}\n${file.content}\n`)
    .join("\n");
}

export function formatMarkdown(files: ExtractedFile[], tree: string): string {
  const sections = [
    "# Repository Analysis\n",
    "## Directory Structure\n",
    "```",
    tree,
    "```\n",
    "## Files\n",
  ];

  files.forEach((file) => {
    sections.push(
      `### ${file.path}\n`,
      "```" + (getFileExtension(file.path) || ""),
      file.content,
      "```\n"
    );
  });

  return sections.join("\n");
}

export function formatJson(
  files: ExtractedFile[],
  tree: string,
  stats: Record<string, any>
): string {
  const output = {
    stats,
    directoryStructure: tree.split("\n"),
    files: files.map((file) => ({
      path: file.path,
      size: file.size,
      content: file.content,
    })),
  };

  return JSON.stringify(output, null, 2);
}

function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  // Maps common extensions to their language names
  const languageMap: Record<string, string> = {
    ".js": "javascript",
    ".ts": "typescript",
    ".py": "python",
    ".rb": "ruby",
    ".java": "java",
    ".cpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".html": "html",
    ".css": "css",
    ".sql": "sql",
    ".sh": "bash",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".json": "json",
    ".md": "markdown",
    ".xml": "xml",
  };

  return languageMap[ext] || "";
}
