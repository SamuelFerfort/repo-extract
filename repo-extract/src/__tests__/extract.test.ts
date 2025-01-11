// src/__tests__/extract.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { extract } from "../lib/extract";
import fs from "fs/promises";
import path from "path";
import { DEFAULT_IGNORE_PATTERNS } from "../constants/patterns";

describe("extract with tic-tac-toe repo", () => {
  const repoUrl = "https://github.com/SamuelFerfort/tic-tac-toe";
  let outputFile: string;

  beforeAll(() => {
    outputFile = path.join(process.cwd(), 'test-output.txt');
  });

  afterAll(async () => {
    try {
      await fs.unlink(outputFile);
    } catch (e) {
      // File might not exist, ignore
    }
  });

  it("should extract only main files", async () => {
    const result = await extract({
      source: repoUrl,
      output: outputFile,
      excludePatterns: [...DEFAULT_IGNORE_PATTERNS, "**/.git/**"]
    });

    // Verify main files content
    expect(result.content).toContain("<!DOCTYPE html>");
    expect(result.content).toContain("function Gameboard()");
    expect(result.content).toContain("@import url");
    
    // Verify tree contains main files
    expect(result.tree).toContain("index.html");
    expect(result.tree).toContain("script.js");
    expect(result.tree).toContain("styles.css");
    expect(result.tree).toContain("README.md");
  });

  it("should extract only JavaScript files when filtered", async () => {
    const result = await extract({
      source: repoUrl,
      includePatterns: ["**/*.js"],
      excludePatterns: [...DEFAULT_IGNORE_PATTERNS, "**/.git/**"],
      output: outputFile
    });

    // Verify only JS content is present
    expect(result.content).toContain("function Gameboard()");
    expect(result.content).not.toContain("<!DOCTYPE html>");
    expect(result.content).not.toContain("@import url");

    // Verify JS files in tree
    expect(result.tree).toContain("script.js");
    expect(result.tree).not.toContain("index.html");
    expect(result.tree).not.toContain("styles.css");
  });

  it("should format as markdown correctly", async () => {
    const result = await extract({
      source: repoUrl,
      format: "markdown",
      excludePatterns: [...DEFAULT_IGNORE_PATTERNS, "**/.git/**"],
      output: outputFile
    });

    expect(result.content).toContain("# Repository Analysis");
    expect(result.content).toMatch(/```html[\s\S]*<!DOCTYPE html>/);
    expect(result.content).toMatch(/```javascript[\s\S]*function Gameboard/);
    expect(result.content).toMatch(/```css[\s\S]*@import url/);
  });

  it("should format as JSON correctly", async () => {
    const result = await extract({
      source: repoUrl,
      format: "json",
      excludePatterns: [...DEFAULT_IGNORE_PATTERNS, "**/.git/**"],
      output: outputFile
    });

    const parsed = JSON.parse(result.content);
    
    // Verify files are properly included
    const jsFile = parsed.files.find(f => f.path === "script.js");
    expect(jsFile).toBeTruthy();
    expect(jsFile.content).toContain("function Gameboard()");
    
    // Verify files are properly formatted
    expect(parsed.files.some(f => f.path === "index.html")).toBeTruthy();
    expect(parsed.files.some(f => f.path === "styles.css")).toBeTruthy();
    expect(parsed.files.some(f => f.path === "README.md")).toBeTruthy();
  });

  it("should handle file exclusions", async () => {
    const result = await extract({
      source: repoUrl,
      excludePatterns: [
        ...DEFAULT_IGNORE_PATTERNS,
        "**/.git/**",
        "**/*.css",
        "**/*.html"
      ],
      output: outputFile
    });

    // Verify excluded files are not present
    expect(result.content).not.toContain("<!DOCTYPE html>");
    expect(result.content).not.toContain("@import url");
    
    // Verify included files are present
    expect(result.content).toContain("function Gameboard()");
    expect(result.tree).toContain("script.js");
  });
});


describe("extract additional features", () => {
  it("should work with local paths", async () => {
    const result = await extract({
      source: ".",  // Current directory
    });
    
    expect(result.tree).toContain("package.json");
    expect(result.content).toBeTruthy();
  });

  it("should provide correct summary format", async () => {
    const result = await extract({
      source: ".",
    });

    expect(result.summary).toContain("Files found:");
    expect(result.summary).toContain("Files excluded by patterns:");
    expect(result.summary).toContain("Files skipped (size limit):");
    expect(result.summary).toContain("Total size:");
    expect(result.summary).toContain("Estimated tokens:");
  });

  it("should enforce default maxFileSize of 10MB", async () => {
    // Create a temporary large file
    const largePath = 'temp-large.txt';
    const largeContent = Buffer.alloc(11 * 1024 * 1024, 'a'); // 11MB
    await fs.writeFile(largePath, largeContent);

    try {
      const result = await extract({
        source: ".",
        includePatterns: ["temp-large.txt"]
      });

      expect(result.stats.filesSkipped).toBe(1);
    } finally {
      await fs.unlink(largePath);
    }
  });

  it("should handle multiple include/exclude patterns", async () => {
    const result = await extract({
      source: ".",
      includePatterns: ["src/**/*.ts", "*.json"],
      excludePatterns: ["**/*.test.ts", "**/*.spec.ts"]
    });

    expect(result.tree).toContain("package.json");
    expect(result.tree).toContain(".ts");
    expect(result.tree).not.toContain(".test.ts");
  });
});