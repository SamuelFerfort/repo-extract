export interface RepoExtractOptions{
    source: string;
    maxFileSize?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
    output?: string | boolean;  // Can be filename or true for default output.txt
  }
  export interface RepoExtractResult {
    summary: string;
    tree: string;
    content: string;
  }
  
  export interface ExtractedFile {
    path: string;
    content: string;
    size: number;
  }