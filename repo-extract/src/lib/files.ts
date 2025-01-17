import { glob } from "glob";
import { minimatch } from "minimatch";
import { ExtractedFile, FileEntry } from "../types";
import fs from "fs/promises";
import path from "path";

export async function getFilteredFiles(
  source: string | FileEntry[],
  ignorePatterns: string[],
  includePatterns?: string[],
): Promise<string[]> {
  // Handle FileEntry array
  if (Array.isArray(source)) {
    const files = source.map((f) => f.path);

    // Apply ignore patterns first
    const filteredFiles = files.filter(
      (file) => !ignorePatterns.some((pattern) => minimatch(file, pattern)),
    );

    // Apply include patterns if specified
    if (includePatterns?.length) {
      return filteredFiles.filter((file) =>
        includePatterns.some((pattern) => minimatch(file, pattern)),
      );
    }

    return filteredFiles;
  }

  // Regular filesystem handling
  const files = await glob("**/*", {
    cwd: source,
    ignore: ignorePatterns,
    nodir: true,
    absolute: true,
    dot: true,
    follow: false,
  });

  // For filesystem paths, we need to handle include patterns separately
  if (includePatterns?.length) {
    return files.filter((file) => {
      const relativePath = path.relative(source, file);
      return includePatterns.some((pattern) =>
        minimatch(relativePath, pattern),
      );
    });
  }

  return files;
}

export async function processFiles(
  source: string | FileEntry[],
  files: string[],
  maxFileSize: number,
): Promise<ExtractedFile[]> {
  // Handle FileEntry array
  if (Array.isArray(source)) {
    const fileMap = new Map(source.map((f) => [f.path, f]));

    const processed = await Promise.all(
      files.map(async (file) => {
        const entry = fileMap.get(file);
        if (!entry) return null;

        // Check size before processing content
        if (entry.size > maxFileSize) {
          console.debug(`Skipping ${file} (exceeds size limit)`);
          return null;
        }

        if (!isContentSafe(entry.content)) {
          console.debug(`Skipping ${file} (contains unsafe content)`);
          return null;
        }

        return {
          path: file,
          content: entry.content,
          size: entry.size,
        };
      }),
    );

    return processed.filter((file): file is ExtractedFile => file !== null);
  }

  // Regular filesystem handling
  const processed = await Promise.all(
    files.map(async (file) => {
      try {
        const stats = await fs.stat(file);

        // Check size before reading file
        if (stats.size > maxFileSize) {
          console.debug(`Skipping ${file} (exceeds size limit)`);
          return null;
        }

        const buffer = await fs.readFile(file);
        const content = buffer.toString("utf-8");

        if (!isContentSafe(content)) {
          console.debug(`Skipping ${file} (contains unsafe content)`);
          return null;
        }

        return {
          path: path.relative(source, file),
          content,
          size: stats.size,
        };
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        return null;
      }
    }),
  );

  return processed.filter((file): file is ExtractedFile => file !== null);
}

function isContentSafe(content: string): boolean {
  const unsafePatterns = ["\u0000"]; // null byte
  return !unsafePatterns.some((pattern) => content.includes(pattern));
}
