#!/usr/bin/env node

import { Command } from "commander";
import { extract } from "./index";

const program = new Command();

program
  .name("repo-to-text")
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
  .action(async (source: string, options) => {
    try {
      const { summary, tree, content } = await extract({
        source,
        maxFileSize: parseInt(options.maxSize),
        includePatterns: options.include,
        excludePatterns: options.exclude,
        output: options.output,
      });

      console.log("\nSummary:");
      console.log(summary);

      if (options.output) {
        console.log(
          `\nAnalysis complete! Output written to: ${options.output}`
        );
      }
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program.parse();
