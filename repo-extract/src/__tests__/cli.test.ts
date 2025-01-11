// src/__tests__/cli.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

describe("CLI", () => {
  const outputPath = path.join(process.cwd(), 'cli-test-output.txt');

  afterAll(async () => {
    try {
      await fs.unlink(outputPath);
    } catch (e) {
    }
  });

  it("should extract from GitHub repo", async () => {
    const { stdout } = await execAsync(`node dist/cli.js https://github.com/SamuelFerfort/tic-tac-toe`);
    
    expect(stdout).toContain("Analysis complete");
    const output = await fs.readFile('output.txt', 'utf-8');
    expect(output).toContain("script.js");
  });

  it("should respect custom output path", async () => {
    await execAsync(`node dist/cli.js https://github.com/SamuelFerfort/tic-tac-toe -o ${outputPath}`);
    
    const exists = await fs.access(outputPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("should handle different formats", async () => {
    await execAsync(`node dist/cli.js . -f json -o ${outputPath}`);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it("should handle include patterns", async () => {
    await execAsync(`node dist/cli.js . -i "**/*.ts" -o ${outputPath}`);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain(".ts");
  });

  it("should respect --include-docs flag", async () => {
    await execAsync(`node dist/cli.js . --include-docs -o ${outputPath}`);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain("README.md");
  });
});
