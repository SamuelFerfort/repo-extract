import fs from "fs/promises";
import path from "path";
import os from "os";
import JSZip from "jszip";
import { Readable } from "stream";

export async function cloneRepository(source: string): Promise<string> {
  // Check if source is a local path
  try {
    const stats = await fs.stat(source);
    if (stats.isDirectory()) {
      return source;
    }
  } catch {} // If stat fails, assume it's a GitHub URL

  // Extract owner/repo from GitHub URL
  const match = source.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error(
      "Source must be either a local directory or a valid GitHub URL",
    );
  }

  const [_, owner, repo] = match;
  const cleanRepo = repo.replace(".git", "");
  const tmpDir = path.join(os.tmpdir(), "repo-to-text", Date.now().toString());

  // Get the zip directly from GitHub's download URL (no API needed!)
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
    return await extractZip(Buffer.from(arrayBuffer), tmpDir);
  }

  const arrayBuffer = await response.arrayBuffer();
  return await extractZip(Buffer.from(arrayBuffer), tmpDir);
}

async function extractZip(buffer: Buffer, tmpDir: string): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  // Create temp directory
  await fs.mkdir(tmpDir, { recursive: true });

  // Extract all files
  const entries = Object.entries(zip.files);
  const rootFolder = entries[0][0].split("/")[0]; // Get the root folder name

  for (const [zipPath, file] of entries) {
    if (file.dir) continue;

    // Remove the root folder from the path
    const relativePath = zipPath.replace(rootFolder + "/", "");
    const filePath = path.join(tmpDir, relativePath);

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Extract and write file
    const content = await file.async("nodebuffer");
    await fs.writeFile(filePath, content);
  }

  return tmpDir;
}
