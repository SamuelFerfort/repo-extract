import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";

export type FileEntry = {
  path: string;
  content: string;
  size: number;
};

export async function cloneRepository(
  source: string,
): Promise<string | FileEntry[]> {
  // Check if source is a local path (only in development)
  if (process.env.NODE_ENV === "development") {
    try {
      const stats = await fs.stat(source);
      if (stats.isDirectory()) {
        return source;
      }
    } catch {}
  }

  // Extract owner/repo from GitHub URL
  const match = source.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error(
      "Source must be either a local directory or a valid GitHub URL",
    );
  }

  const [_, owner, repo] = match;
  const cleanRepo = repo.replace(".git", "");

  // Check repository size first
  const sizeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${cleanRepo}`,
    {
      headers: process.env.GITHUB_TOKEN
        ? {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }
        : {},
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!sizeResponse.ok) {
    throw new Error(
      `Failed to check repository size: ${sizeResponse.statusText}`,
    );
  }

  const repoInfo = await sizeResponse.json();
  if (repoInfo.size > 50000) {
    // 50MB limit
    throw new Error("Repository too large for analysis");
  }

  // Try main branch first
  let response = await fetch(
    `https://github.com/${owner}/${cleanRepo}/archive/refs/heads/main.zip`,
    { signal: AbortSignal.timeout(25000) },
  );

  // Try master if main fails
  if (!response.ok) {
    response = await fetch(
      `https://github.com/${owner}/${cleanRepo}/archive/refs/heads/master.zip`,
      { signal: AbortSignal.timeout(25000) },
    );

    if (!response.ok) {
      throw new Error(`Failed to download repository: ${response.statusText}`);
    }
  }

  // Process ZIP content
  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(Buffer.from(arrayBuffer));
  const files: FileEntry[] = [];
  const rootFolder = Object.keys(zip.files)[0].split("/")[0];

  for (const [zipPath, file] of Object.entries(zip.files)) {
    if (file.dir) continue;

    try {
      const relativePath = zipPath.replace(rootFolder + "/", "");
      const content = await file.async("text");
      files.push({
        path: relativePath,
        content,
        size: content.length,
      });
    } catch (error) {
      console.error(`Failed to process file ${zipPath}:`, error);
    }
  }

  if (process.env.VERCEL) {
    return files;
  }

  // For local development, still use filesystem
  const tmpDir = path.join(process.cwd(), "tmp", Date.now().toString());
  await fs.mkdir(tmpDir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(tmpDir, file.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.content);
  }

  return tmpDir;
}
