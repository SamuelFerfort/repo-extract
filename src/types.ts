export interface RepoExtractOptions {
  source: string;
  maxFileSize?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  output?: string | boolean;
  format?: 'text' | 'json' | 'markdown';
}

export interface RepoExtractResult {
  summary: string;
  tree: string;
  content: string;
  stats: {
    filesFound: number;
    filesExcluded: number;
    filesSkipped: number;
    totalSize: number;
    totalTokens: number;
  };
}
export interface ExtractedFile {
  path: string;
  content: string;
  size: number;
}
export interface ExtractedFile {
  path: string;
  content: string;
  size: number;
}

export interface CliOptions {
  output?: string;
  maxSize: string;
  exclude?: string[];
  include?: string[];
  includeDocs?: boolean;
  dryRun?: boolean;
  format?: "text" | "json" | "markdown";
}
