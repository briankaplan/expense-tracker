import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface RecoveryPoint {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual';
  description: string;
  files: string[];
}

export class RecoveryManager {
  private recoveryDir: string;
  private recoveryFile: string;
  private recoveryPoints: RecoveryPoint[];

  constructor() {
    this.recoveryDir = path.join(process.cwd(), '.nexus', 'recovery');
    this.recoveryFile = path.join(this.recoveryDir, 'recovery-points.json');
    this.recoveryPoints = this.loadRecoveryPoints();
  }

  async createRecoveryPoint(type: 'auto' | 'manual', description?: string): Promise<void> {
    console.log(chalk.blue('\n💾 Creating Recovery Point...\n'));

    // Get modified files
    const modifiedFiles = this.getModifiedFiles();
    if (modifiedFiles.length === 0) {
      console.log(chalk.yellow('No changes to backup'));
      return;
    }

    // Create recovery point
    const point: RecoveryPoint = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      description: description || `${type} recovery point`,
      files: modifiedFiles
    };

    // Backup files
    await this.backupFiles(point);

    // Save recovery point
    this.recoveryPoints.push(point);
    this.saveRecoveryPoints();

    console.log(chalk.green('✅ Recovery point created successfully'));
  }

  async restorePoint(id: string): Promise<void> {
    console.log(chalk.blue('\n⏮️ Restoring Recovery Point...\n'));

    const point = this.recoveryPoints.find(p => p.id === id);
    if (!point) {
      console.log(chalk.red('Recovery point not found'));
      return;
    }

    // Restore files
    for (const file of point.files) {
      const backupPath = path.join(this.recoveryDir, point.id, file);
      const targetPath = path.join(process.cwd(), file);

      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, targetPath);
        console.log(chalk.gray(`Restored: ${file}`));
      }
    }

    console.log(chalk.green('✅ Recovery completed successfully'));
  }

  listRecoveryPoints(): void {
    console.log(chalk.blue('\n📋 Recovery Points\n'));

    if (this.recoveryPoints.length === 0) {
      console.log(chalk.yellow('No recovery points found'));
      return;
    }

    this.recoveryPoints
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach(point => {
        const icon = point.type === 'auto' ? '🔄' : '💾';
        console.log(`${icon} ${point.id} (${new Date(point.timestamp).toLocaleString()})`);
        console.log(chalk.gray(`   Type: ${point.type}`));
        console.log(chalk.gray(`   Description: ${point.description}`));
        console.log(chalk.gray(`   Files: ${point.files.length}`));
        console.log();
      });
  }

  private loadRecoveryPoints(): RecoveryPoint[] {
    try {
      if (fs.existsSync(this.recoveryFile)) {
        return JSON.parse(fs.readFileSync(this.recoveryFile, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load recovery points:', error);
    }
    return [];
  }

  private saveRecoveryPoints(): void {
    try {
      if (!fs.existsSync(this.recoveryDir)) {
        fs.mkdirSync(this.recoveryDir, { recursive: true });
      }
      fs.writeFileSync(this.recoveryFile, JSON.stringify(this.recoveryPoints, null, 2));
    } catch (error) {
      console.error('Failed to save recovery points:', error);
    }
  }

  private getModifiedFiles(): string[] {
    try {
      return execSync('git ls-files -m')
        .toString()
        .split('\n')
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private async backupFiles(point: RecoveryPoint): Promise<void> {
    const backupDir = path.join(this.recoveryDir, point.id);
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy files
    for (const file of point.files) {
      const sourcePath = path.join(process.cwd(), file);
      const targetPath = path.join(backupDir, file);
      
      // Create target directory if it doesn't exist
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy file
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(chalk.gray(`Backed up: ${file}`));
      }
    }
  }
} 