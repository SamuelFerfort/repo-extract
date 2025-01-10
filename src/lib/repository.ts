import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { simpleGit } from 'simple-git';

export async function cloneRepository(url: string): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), 'repo-to-text', Date.now().toString());
  await fs.mkdir(tmpDir, { recursive: true });
  
  const git = simpleGit();
  await git.clone(url, tmpDir, ['--depth', '1']);
  
  return tmpDir;
}