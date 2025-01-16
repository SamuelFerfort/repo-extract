// files.ts
import { glob } from "glob";
import { minimatch } from "minimatch";
import { ExtractedFile } from "../types";
import fs from "fs/promises";
import path from "path";
import { readVirtualFile } from "./repository";

export async function getFilteredFiles(
  workingDir: string,
  ignorePatterns: string[],
  includePatterns?: string[],
): Promise<string[]> {
  if (workingDir.startsWith("memory://")) {
    // Handle virtual filesystem
    const virtualFs = JSON.parse(workingDir.replace("memory://", ""));
    const files = Object.keys(virtualFs);

    // Apply ignore patterns
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
  return glob("**/*", {
    cwd: workingDir,
    ignore: ignorePatterns,
    nodir: true,
    absolute: true,
    dot: true,
    follow: false,
  });
}

export async function processFiles(
  workingDir: string,
  files: string[],
  maxFileSize: number,
): Promise<ExtractedFile[]> {
  const isVirtual = workingDir.startsWith("memory://");

  const processed = await Promise.all(
    files.map(async (file) => {
      try {
        let content: string;
        let size: number;

        if (isVirtual) {
          content = await readVirtualFile(workingDir, file);
          size = Buffer.from(content).length;
        } else {
          const stats = await fs.stat(file);
          if (stats.size > maxFileSize) {
            console.debug(`Skipping ${file} (exceeds size limit)`);
            return null;
          }
          const buffer = await fs.readFile(file);
          content = buffer.toString("utf-8");
          size = stats.size;
        }

        if (size > maxFileSize) {
          console.debug(`Skipping ${file} (exceeds size limit)`);
          return null;
        }

        // Only skip truly problematic files
        if (!isContentSafe(content)) {
          console.debug(`Skipping ${file} (contains unsafe content)`);
          return null;
        }

        return {
          path: isVirtual ? file : path.relative(workingDir, file),
          content,
          size,
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
