import { glob } from "glob";
import { minimatch } from "minimatch";
import { ExtractedFile } from "../types";
import fs from "fs/promises";
import path from "path";


// Helper function to check if a file might be binary
function isBinaryBuffer(buffer: Buffer): boolean {
  // Check for null bytes and control characters
  const controlChars = buffer.slice(0, Math.min(buffer.length, 24));
  return controlChars.some(
    (byte) =>
      byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)
  );
}

// Helper function to check content safety
function isContentSafe(content: string): boolean {
  const unsafePatterns = [
    "<|endoftext|>",
    "\x00",
    "\ufffd", 
  ];
  return !unsafePatterns.some((pattern) => content.includes(pattern));
}

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
      try {
        const stats = await fs.stat(file);

        // Size check
        if (stats.size > maxFileSize) {
          console.debug(`Skipping ${file} (exceeds size limit)`);
          return null;
        }

        // Read file as buffer first
        const buffer = await fs.readFile(file);

        // Binary check
        if (isBinaryBuffer(buffer)) {
          console.debug(`Skipping ${file} (appears to be binary)`);
          return null;
        }

        // Convert to string and check content safety
        const content = buffer.toString("utf-8");
        if (!isContentSafe(content)) {
          console.debug(`Skipping ${file} (contains unsafe content)`);
          return null;
        }

        return {
          path: path.relative(workingDir, file),
          content,
          size: stats.size,
        };
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        return null;
      }
    })
  );

  return processed.filter((file): file is ExtractedFile => file !== null);
}
