export const DEFAULT_IGNORE_PATTERNS = [
  // Hidden files and directories (start with .)
  ".*",
  "**/.*",
  ".*/**",
  "**/.*/",

  // Build and cache
  "**/*.pyc",
  "**/*.pyo",
  "**/*.pyd",
  "**/__pycache__",
  '**/node_modules/**',
  "**/bower_components",
  "**/dist",
  "**/build",
  "**/coverage",
  "**/.next",
  "**/.nuxt",
  "**/out",
  "**/.output",
  "**/target", // Rust builds
  "**/vendor", // Go dependencies

  // Version control
  "**/.git",
  "**/.svn",
  "**/.hg",
  "**/.gitattributes",
  "**/.gitignore",
  "**/.gitmodules",

  // Package locks and dependency files
  "**/package-lock.json",
  "**/yarn.lock",
  "**/pnpm-lock.yaml",
  "**/poetry.lock",
  "**/Pipfile.lock",
  "**/Gemfile.lock",
  "**/composer.lock",
  "**/cargo.lock",
  "**/mix.lock",
  "**/requirements.txt",
  "**/go.sum",

  // Images and assets
  "**/*.{jpg,jpeg,png,gif,webp,avif,tiff,bmp,ico,svg,eps,raw}",
  "**/*.{woff,woff2,ttf,otf,eot}", // Fonts
  "**/*.{css.map,js.map}", // Source maps
  "**/assets/**",
  "**/public/**",
  "**/static/**",

  // Documents and binary
  "**/*.{pdf,doc,docx,xls,xlsx,zip,tar,gz,rar,7z}",

  // Media
  "**/*.{mov,mp4,avi,wmv,mp3,wav,flac,m4a}",

  // Large data files
  "**/*.{bin,data,db,sqlite,sqlite3}",
  "**/*.{csv,tsv,xls,xlsx}", // Data files
  "**/*.min.js", // Minified files
  "**/*.min.css",

  // Configuration files (often not relevant for code understanding)
  "**/.env*",
  "**/.editorconfig",
  "**/.prettierrc*",
  "**/.eslintrc*",
  "**/tsconfig*.json",
  "**/jest.config.*",
  "**/babel.config.*",
  "**/webpack.config.*",
  "**/rollup.config.*",
  "**/vite.config.*",
  "**/.dockerignore",
  "**/Dockerfile*",
  "**/docker-compose*.yml",
  "**/*.toml", // Often config files
  "**/*.yaml", // Often config files
  "**/*.yml", // Often config files
  "**/nginx.conf",

  // Logs and temporary files
  "**/*.{log,tmp}",
  "**/tmp/",
  "**/temp/",
  "**/logs/",
  "**/.cache",
  "**/.pytest_cache",

  // IDE and system files
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/.idea",
  "**/.vscode",
  "**/.vs",
  "**/*.sublime-*",
  "**/.project",
  "**/.settings",
  "**/.classpath",

];
