# repo-extract

Extract repository content into a formatted text dump for LLM analysis.

## Install

### As a CLI tool
```bash
npm install -g repo-extract
```

### As a package
```bash
npm install repo-extract
```

## Usage

### CLI
```bash
repo-extract https://github.com/user/repo
# Creates output.txt with repository content
```

### Package
```typescript
import { extract } from 'repo-extract';

const {summary, tree, content, stats, tokens} = await extract({
  source: 'https://github.com/user/repo',    // Repository URL or local path
  output: 'output.txt',                      // Optional: output file path
  format: 'text',                            // Optional: 'text' | 'json' | 'markdown' (default text)
  includePatterns: ['src/**/*.ts'],          // Optional: files to include
  excludePatterns: ['**/*.test.ts'],         // Optional: files to exclude
  maxFileSize: 10485760                      // Optional: max file size in bytes (default: 10MB)
});

// Returns:
// - summary: Overview of processed files, sizes and tokens
// - tree: Repository file structure visualization
// - content: Extracted contents in specified format 
// - stats: Detailed analysis statistics
// - tokens: Estimates tokens
```

## Options

### CLI Options
- `-o, --output <path>` - Custom output file path
- `-f, --format <format>` - Output format: text, json, or markdown (default: text)
- `--include-docs` - Include documentation files (README, md, etc)
- `-i, --include <glob>` - Include specific files (glob patterns)
- `-e, --exclude <glob>` - Exclude specific files (glob patterns)
- `-s, --max-size <bytes>` - Max file size to process (default: 10MB)

## Examples

### CLI

```bash
# Extract GitHub repo
repo-extract https://github.com/user/repo

# Extract current directory as JSON
repo-extract . -f json

# Extract repository content, include only source code, exclude tests, and output as JSON
repo-extract . -i "src/**/*.ts" -e "**/*.test.ts" -f json

# Extract content from a GitHub repo and output as Markdown, excluding documentation files
repo-extract https://github.com/user/repo -f markdown --exclude-docs


```

### Package

```typescript
import { extract } from 'repo-extract';

// Basic usage
const { summary, content } = await extract({
  source: '.',
  format: 'json'
});

// With multiple options
const result = await extract({
  source: 'https://github.com/user/repo',
  format: 'markdown',
  includePatterns: ['src/**/*.ts'],
  excludePatterns: ['**/*.test.ts']
});
```

## License

This project is licensed under the [MIT License](LICENSE).