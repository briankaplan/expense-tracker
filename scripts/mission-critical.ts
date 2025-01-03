import { chalk, readFile, joinPath } from './utils/fs-helpers';
import fs from 'fs';
import path from 'path';
import { verifyCleanup } from './verify-cleanup';
import { verifyTypes } from './verify-types';
import { verifyComponents } from './verify-components';
import { verifyFeatures } from './verify-features';
import { execSync } from 'child_process';
import crypto from 'crypto';

export interface MissionCritical {
  phase: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  verificationRequired: boolean;
  dependencies: string[];
  securityLevel: 'low' | 'medium' | 'high';
  rollbackPlan: string;
}

export interface RollbackPoint {
  timestamp: string;
  phase: string;
  files: {
    path: string;
    content: string;
    hash: string;
  }[];
  gitCommit?: string;
  description: string;
}

export interface RollbackSystem {
  createCheckpoint: (phase: string, description: string) => Promise<void>;
  rollback: (toPhase: string) => Promise<void>;
  verifyCheckpoint: (phase: string) => Promise<boolean>;
  listCheckpoints: () => RollbackPoint[];
}

export interface DuplicateCheck {
  pattern: RegExp;
  type: 'type' | 'component' | 'utility';
  description: string;
}

export interface DuplicateEntry {
  name: string;
  type: string;
  locations: string[];
}

export class MissionCriticalSystem implements RollbackSystem {
  private checkpoints: RollbackPoint[] = [];
  private currentPhase: string = 'initialization';

  async createCheckpoint(phase: string, description: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const files = await this.collectFiles();
    const gitCommit = await this.getCurrentCommit();

    this.checkpoints.push({
      timestamp,
      phase,
      files,
      gitCommit,
      description
    });

    console.log(chalk.green(`✅ Created checkpoint for phase: ${phase}`));
  }

  async rollback(toPhase: string): Promise<void> {
    const checkpoint = this.checkpoints.find(cp => cp.phase === toPhase);
    if (!checkpoint) {
      throw new Error(`No checkpoint found for phase: ${toPhase}`);
    }

    // Restore files
    for (const file of checkpoint.files) {
      await fs.promises.writeFile(file.path, file.content);
    }

    // Reset git if commit exists
    if (checkpoint.gitCommit) {
      await this.resetToCommit(checkpoint.gitCommit);
    }

    this.currentPhase = toPhase;
    console.log(chalk.green(`✅ Rolled back to phase: ${toPhase}`));
  }

  async verifyCheckpoint(phase: string): Promise<boolean> {
    const checkpoint = this.checkpoints.find(cp => cp.phase === phase);
    if (!checkpoint) return false;

    for (const file of checkpoint.files) {
      const currentContent = await fs.promises.readFile(file.path, 'utf8');
      const currentHash = this.calculateHash(currentContent);
      if (currentHash !== file.hash) return false;
    }

    return true;
  }

  listCheckpoints(): RollbackPoint[] {
    return this.checkpoints;
  }

  private async collectFiles(): Promise<{ path: string; content: string; hash: string; }[]> {
    const files: { path: string; content: string; hash: string; }[] = [];
    const srcDir = path.join(process.cwd(), 'src');

    const collectRecursive = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await collectRecursive(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = await fs.promises.readFile(fullPath, 'utf8');
          files.push({
            path: fullPath,
            content,
            hash: this.calculateHash(content)
          });
        }
      }
    };

    await collectRecursive(srcDir);
    return files;
  }

  private calculateHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async getCurrentCommit(): Promise<string> {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return '';
    }
  }

  private async resetToCommit(commit: string): Promise<void> {
    const { execSync } = require('child_process');
    execSync(`git reset --hard ${commit}`);
  }
}

export async function verifyMissionStatus(): Promise<boolean> {
  console.log(chalk.blue('\n🔍 Verifying Mission Critical Status\n'));

  try {
    // Run all verifications
    await verifyCleanup();
    await verifyTypes();
    await verifyComponents();
    await verifyFeatures();

    console.log(chalk.green('\n✅ Mission critical verification passed!\n'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Mission critical verification failed:'), error);
    return false;
  }
}

export function checkForDuplicates(): DuplicateEntry[] {
  const duplicates: DuplicateEntry[] = [];
  const srcDir = path.join(process.cwd(), 'src');

  const checks: DuplicateCheck[] = [
    {
      pattern: /interface\s+(\w+)/g,
      type: 'type',
      description: 'Interface definition'
    },
    {
      pattern: /class\s+(\w+)/g,
      type: 'component',
      description: 'Class definition'
    },
    {
      pattern: /function\s+(\w+)/g,
      type: 'utility',
      description: 'Function definition'
    }
  ];

  const processFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(check => {
      let match;
      while ((match = check.pattern.exec(content)) !== null) {
        const name = match[1];
        const existing = duplicates.find(d => d.name === name);
        
        if (existing) {
          existing.locations.push(filePath);
        } else {
          duplicates.push({
            name,
            type: check.type,
            locations: [filePath]
          });
        }
      }
    });
  };

  const processDir = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        processDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        processFile(fullPath);
      }
    });
  };

  processDir(srcDir);
  return duplicates.filter(d => d.locations.length > 1);
}

// Run if called directly
if (require.main === module) {
  verifyMissionStatus().catch(error => {
    console.error(chalk.red('\n❌ Mission critical verification failed:'), error);
    process.exit(1);
  });
}

export {
  MissionCriticalSystem,
  verifyMissionStatus,
  checkForDuplicates,
  type MissionCritical,
  type RollbackPoint,
  type RollbackSystem,
  type DuplicateCheck,
  type DuplicateEntry
}; 