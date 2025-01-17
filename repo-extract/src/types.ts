export interface RepoExtractOptions {
  source: string;
  maxFileSize?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  output?: string | boolean;
  format?: "text" | "json" | "markdown";
  chunkSize?: number;
}

export interface ExtractedFile {
  path: string;
  content: string;
  size: number;
}

export interface RepoExtractResult {
  summary: string;
  tree: string;
  fullContent: string; // Full repository content as a single string
  chunks: string[]; // Repository content split into chunks
  stats: {
    filesFound: number;
    filesExcluded: number;
    filesSkipped: number;
    totalSize: number;
    totalTokens: number;
  };
  tokens: number;
}

export interface CliOptions {
  output?: string;
  maxSize: string;
  exclude?: string[];
  include?: string[];
  includeDocs?: boolean;
  dryRun?: boolean;
  format?: "text" | "json" | "markdown";
  chunkSize?: number;
}
export interface FileEntry {
  path: string;
  content: string;
  size: number;
}

export interface ExtractedFile extends FileEntry {
  //  any additional fields for ExtractedFile
}
