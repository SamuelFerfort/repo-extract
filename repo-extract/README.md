# repo-extract

Extract repository content into a formatted text dump for LLM analysis. Perfect for analyzing codebases with AI models like DeepSeek, OpenAI, or other LLMs.

---

## Features

- Extract Repository Content: Dump entire repositories or specific files into a structured format.
- Multiple Output Formats: Supports text, json, and markdown formats for flexibility.
- Customizable Filters: Include or exclude files using glob patterns.
- Token Estimation: Estimates token count for LLM compatibility.
- Chunking Support: Split large repositories into smaller chunks for LLMs with token limits.
- CLI and Package: Use as a command-line tool or integrate into your Node.js projects.

---

## Why Use This?

- AI-Powered Code Analysis: Prepare repository content for AI-driven code reviews, documentation, or analysis.
- Customizable Outputs: Tailor the output to your needs with flexible formatting and filtering options.
- Handles Large Repositories: Use the chunkSize option to process repositories that exceed LLM token limits.
- Easy Integration: Works as a CLI tool or a Node.js package for seamless integration into your workflow.

---

## Install

### As a CLI Tool
npm install -g repo-extract

### As a Package
npm install repo-extract

---

## Usage

### CLI
repo-extract https://github.com/user/repo
# Creates output.txt with repository content

### Package
```typescript
import { extract } from 'repo-extract';

const { summary, tree, content, stats, tokens } = await extract({
  source: 'https://github.com/user/repo',    // Repository URL or local path
  output: 'output.txt',                      // Optional: output file path
  format: 'text',                            // Optional: 'text' | 'json' | 'markdown' (default: text)
  includePatterns: ['src/**/*.ts'],          // Optional: files to include
  excludePatterns: ['**/*.test.ts'],         // Optional: files to exclude
  maxFileSize: 10485760,                     // Optional: max file size in bytes (default: 10MB)
  chunkSize: 32000                           // Optional: max tokens per chunk (default: no chunking)
});

// Returns:
// - summary: Overview of processed files, sizes, and tokens
// - tree: Repository file structure visualization
// - content: Extracted contents in the specified format
// - stats: Detailed analysis statistics
// - tokens: Estimated token count
```
---

## Options

### CLI Options
- -o, --output <path>: Custom output file path.
- -f, --format <format>: Output format: text, json, or markdown (default: text).
- --include-docs: Include documentation files (e.g., README, markdown files).
- -i, --include <glob>: Include specific files using glob patterns (e.g., src/**/*.ts).
- -e, --exclude <glob>: Exclude specific files using glob patterns (e.g., **/*.test.ts).
- -s, --max-size <bytes>: Max file size to process in bytes (default: 10MB).
- --chunk-size <tokens>: Max tokens per chunk (default: no chunking). Useful for LLM token limits.

### Package Options
- source: Repository URL or local path.
- maxFileSize: Max file size in bytes (default: 10MB).
- includePatterns: Array of glob patterns to include (e.g., ['src/**/*.ts']).
- excludePatterns: Array of glob patterns to exclude (e.g., ['**/*.test.ts']).
- output: Output file path (optional).
- format: Output format: text, json, or markdown (default: text).
- chunkSize: Max tokens per chunk (optional). Useful for LLM token limits.

---

## Examples

### CLI Examples

#### Extract a GitHub Repository
```bash
repo-extract https://github.com/user/repo

#### Extract Current Directory as JSON
repo-extract . -f json

#### Extract Only Source Code, Exclude Tests, and Output as JSON
repo-extract . -i "src/**/*.ts" -e "**/*.test.ts" -f json

#### Extract Content from a GitHub Repo and Output as Markdown (Exclude Documentation Files)
repo-extract https://github.com/user/repo -f markdown --exclude-docs

#### Extract with Chunking for LLM Token Limits
repo-extract https://github.com/user/repo --chunk-size 32000
```
### Package Examples

#### Basic Usage
```typescript
import { extract } from 'repo-extract';

const { summary, content } = await extract({
  source: '.',
  format: 'json'
});
```
#### Advanced Usage with Multiple Options
```typescript
const result = await extract({
  source: 'https://github.com/user/repo',
  format: 'markdown',
  includePatterns: ['src/**/*.ts'],
  excludePatterns: ['**/*.test.ts'],
  chunkSize: 32000
});
```
---

## Advanced Usage

### Chunking for Large Repositories
If your repository exceeds the token limit of your LLM (e.g., 32k tokens for DeepSeek), use the chunkSize option to split the content into smaller chunks.
```typescript
const result = await extract({
  source: 'https://github.com/user/repo',
  chunkSize: 32000 // Split content into 32k token chunks
});
```
### Custom Output Formats
Choose from text, json, or markdown formats to suit your needs.
```typescript
const result = await extract({
  source: 'https://github.com/user/repo',
  format: 'markdown' // Output as Markdown
});
```

### Filtering Files
Use includePatterns and excludePatterns to focus on specific files or directories.
```typescript
const result = await extract({
  source: 'https://github.com/user/repo',
  includePatterns: ['src/**/*.ts'], // Include only TypeScript files
  excludePatterns: ['**/*.test.ts'] // Exclude test files
});
```
---

## License

This project is licensed under the MIT License.