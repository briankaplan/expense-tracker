export interface SystemState {
  monitorState: {
    lastCheck: string;
    status: 'active' | 'inactive';
    metrics: Record<string, any>;
  };
  coordinatorState: {
    lastAction: string;
    pendingTasks: number;
    activeProcesses: string[];
  };
  autoFixState: {
    lastFix: string;
    fixesApplied: number;
    pendingFixes: string[];
  };
  securityState: {
    lastScan: string;
    threats: number;
    integrityStatus: 'valid' | 'compromised';
  };
}

export interface SubsystemStatus {
  active: boolean;
  lastUpdate: string;
  error?: string;
}

export interface SecurityConfig {
  checkInterval: number;
  backupInterval: number;
  integrityChecks: boolean;
  autoFix: boolean;
}

export interface NexusEvent {
  type: 'monitor' | 'coordinator' | 'autofix' | 'security';
  action: string;
  timestamp: string;
  data: Record<string, any>;
  status: 'success' | 'failure' | 'pending';
} 