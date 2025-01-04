export interface AIMemory {
  currentContext: {
    task: string;
    progress: number;
    startTime: string;
    lastUpdate: string;
  };
  projectState: {
    lastKnownGoodState: {
      packageHash: string;
      nodeModulesHash: string;
      timestamp: string;
    };
    developmentHistory: {
      timestamp: string;
      action: string;
      result: string;
    }[];
    completedFeatures: string[];
    plannedFeatures: string[];
  };
  humanInteractions: {
    timestamp: string;
    input: string;
    understanding: string;
    plannedActions: string[];
  }[];
  systemHealth: {
    packageIntegrity: boolean;
    moduleState: boolean;
    lastVerified: string;
  };
}

export interface StateGuard {
  timestamp: string;
  packageLock: string;
  nodeModules: string[];
  gitHash: string;
  lastGoodBuild: string;
}

export interface CoordinatorConfig {
  gitBackupInterval: number;
  stateCheckInterval: number;
  memoryFile: string;
  stateFile: string;
}

export interface ActionPlan {
  action: string;
  priority: number;
  dependencies: string[];
  estimatedTime: number;
  rollbackPlan: string;
}

export interface SystemStateVerification {
  packageIntegrity: boolean;
  moduleState: boolean;
  gitState: boolean;
  buildState: boolean;
  lastVerified: string;
  issues: string[];
} 