export interface FixResult {
  fixed: boolean;
  changes: string[];
  errors?: string[];
}

export interface FileIssue {
  file: string;
  line: number;
  type: 'typescript' | 'lint' | 'console' | 'import';
  message: string;
}

export interface AutoFixConfig {
  backupDir: string;
  maxBackups: number;
  structure: Record<string, string[]>;
  ignorePaths: string[];
}

export interface DependencyInfo {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

export interface ImportFix {
  path: string;
  name: string;
  isType: boolean;
}

export interface TypeScriptError {
  code: string;
  message: string;
  file: string;
  line: number;
  character: number;
}

export interface ConsoleIssue {
  type: 'log' | 'error' | 'warn' | 'info';
  line: number;
  file: string;
  message: string;
}

export interface LintingResult {
  filePath: string;
  messages: {
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    messageId: string;
    endLine: number;
    endColumn: number;
  }[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source: string;
} 