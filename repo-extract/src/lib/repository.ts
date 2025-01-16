import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";

export async function cloneRepository(source: string): Promise<string> {
  // Check if source is a local path (only in development)
  if (process.env.NODE_ENV === "development") {
    try {
      const stats = await fs.stat(source);
      if (stats.isDirectory()) {
        return source;
      }
    } catch {} // If stat fails, assume it's a GitHub URL
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

  // Get the zip directly from GitHub's download URL
  const zipUrl = `https://github.com/${owner}/${cleanRepo}/archive/refs/heads/main.zip`;
  const response = await fetch(zipUrl);

  if (!response.ok) {
    // Try master if main fails
    const masterUrl = `https://github.com/${owner}/${cleanRepo}/archive/refs/heads/master.zip`;
    const masterResponse = await fetch(masterUrl);

    if (!masterResponse.ok) {
      throw new Error(`Failed to download repository: ${response.statusText}`);
    }

    const arrayBuffer = await masterResponse.arrayBuffer();
    return await processZipContent(Buffer.from(arrayBuffer));
  }

  const arrayBuffer = await response.arrayBuffer();
  return await processZipContent(Buffer.from(arrayBuffer));
}

async function processZipContent(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.entries(zip.files);
  const rootFolder = entries[0][0].split("/")[0];

  // Instead of writing to disk, we'll create a virtual file system in memory
  const virtualFs: Record<string, string> = {};

  // Process all files
  for (const [zipPath, file] of entries) {
    if (file.dir) continue;

    // Remove the root folder from the path
    const relativePath = zipPath.replace(rootFolder + "/", "");

    // Get file content
    const content = await file.async("text");
    virtualFs[relativePath] = content;
  }

  // Return a special path that our other functions will recognize
  return `memory://${JSON.stringify(virtualFs)}`;
}

// Add this to your files.ts
export async function readVirtualFile(
  virtualPath: string,
  filePath: string,
): Promise<string> {
  if (virtualPath.startsWith("memory://")) {
    const virtualFs = JSON.parse(virtualPath.replace("memory://", ""));
    return virtualFs[filePath] || "";
  }

  // Fall back to regular file system
  return fs.readFile(path.join(virtualPath, filePath), "utf-8");
}
