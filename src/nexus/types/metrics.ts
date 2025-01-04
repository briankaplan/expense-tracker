export interface SystemMetrics {
  buildTime: number;
  bundleSize: number;
  testCoverage: number;
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
  };
  performance: {
    timeToFirstBuild: number;
    averageBuildTime: number;
    bundleLoadTime: number;
  };
}

export interface SecurityMetrics {
  lastBackup: string;
  fileIntegrity: {
    total: number;
    modified: number;
    protected: number;
  };
  unauthorizedAccess: number;
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
  };
}

export interface ProjectMetrics {
  codeQuality: {
    complexity: number;
    duplication: number;
    techDebt: number;
  };
  gitMetrics: {
    commits: number;
    branches: number;
    contributors: number;
  };
  testMetrics: {
    coverage: number;
    passing: number;
    failing: number;
  };
}

export interface AnomalyDetection {
  type: 'security' | 'performance' | 'quality';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  context: Record<string, any>;
}

export interface MetricsHistory {
  timestamp: string;
  metrics: {
    system: SystemMetrics;
    security: SecurityMetrics;
    project: ProjectMetrics;
  };
  anomalies: AnomalyDetection[];
  analysis: string;
}