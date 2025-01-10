#!/usr/bin/env node

import { Command, Option } from "commander";
import { extract } from "./index";
import { CliOptions } from "./types";
const program = new Command();

program
  .name("repo-extract")
  .description(
    "CLI tool to analyze and create text dumps of codebases for LLMs"
  )
  .version("0.1.0")
  .argument("<source>", "Source directory or repository URL")
  .option("-o, --output <path>", "Output file path")
  .option(
    "-s, --max-size <size>",
    "Maximum file size to process in bytes",
    "10485760"
  )
  .option("-e, --exclude <patterns...>", "Patterns to exclude")
  .option("-i, --include <patterns...>", "Patterns to include")
  .option(
    "--include-docs",
    "Include documentation files (README, markdown, etc)"
  )
  .addOption(
    new Option("-f, --format <format>", "Output format")
      .choices(["text", "json", "markdown"])
      .default("text")
  )
  .action(async (source: string, options: CliOptions) => {
    try {
      // Set default output filename based on format
      const defaultOutput = options.format === 'json' ? 'output.json' 
        : options.format === 'markdown' ? 'output.md'
        : 'output.txt';

      let excludePatterns = options.exclude || [];
      if (!options.includeDocs) {
        excludePatterns = [
          ...excludePatterns,
          "**/*.md",
          "**/*.mdx",
          "**/LICENSE*",
          "**/CHANGELOG*",
        ];
      }

      const { summary, tree, content } = await extract({
        source,
        maxFileSize: parseInt(options.maxSize),
        includePatterns: options.include,
        excludePatterns,
        output: options.output || defaultOutput,
        format: options.format,
      });

      console.log("\nSummary:");
      console.log(summary);
      console.log(
        `\nAnalysis complete! Output written to: ${options.output || defaultOutput}`
      );
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program.parse();