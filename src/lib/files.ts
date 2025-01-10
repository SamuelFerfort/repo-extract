import { glob } from "glob";
import { minimatch } from "minimatch";
import { ExtractedFile } from "../types";
import fs from "fs/promises";
import path from "path";

export async function getFilteredFiles(
  workingDir: string,
  ignorePatterns: string[],
  includePatterns?: string[]
): Promise<string[]> {
  const files = await glob("**/*", {
    cwd: workingDir,
    ignore: ignorePatterns,
    nodir: true,
    absolute: true,
    dot: true,
    follow: false,
  });

  if (!includePatterns?.length) {
    return files;
  }

  return files.filter((file) =>
    includePatterns.some((pattern) =>
      minimatch(path.relative(workingDir, file), pattern)
    )
  );
}

export async function processFiles(
  workingDir: string,
  files: string[],
  maxFileSize: number
): Promise<ExtractedFile[]> {
  const processed = await Promise.all(
    files.map(async (file) => {
      const stats = await fs.stat(file);
      if (stats.size > maxFileSize) {
        return null;
      }
      const content = await fs.readFile(file, "utf-8");
      return {
        path: path.relative(workingDir, file),
        content,
        size: stats.size,
      };
    })
  );

  return processed.filter((file): file is ExtractedFile => file !== null);
}
