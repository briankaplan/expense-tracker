const { projectState } = require('./state/project-state');
const { execSync } = require('child_process');
const chalk = require('chalk');

interface BrainCheck {
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  priority: number;
}

class NexusBrain {
  private checks: BrainCheck[] = [];

  constructor() {
    this.setupChecks();
  }

  async checkAndRun(): Promise<void> {
    console.log(chalk.blue('\n🧠 Nexus Brain Analyzing...\n'));

    // Sort checks by priority
    const sortedChecks = [...this.checks].sort((a, b) => b.priority - a.priority);

    for (const check of sortedChecks) {
      if (check.condition()) {
        console.log(chalk.yellow(`\n${check.name}:`));
        try {
          await check.action();
        } catch (error) {
          console.log(chalk.red(`\n⚠️  ${check.name} failed:`));
          console.log(chalk.red(error.message || 'Unknown error'));
          // Continue with other checks instead of exiting
          continue;
        }
      }
    }
  }

  private setupChecks() {
    // Check for outdated dependencies
    this.checks.push({
      name: 'Dependency Check',
      condition: () => this.shouldCheckDependencies(),
      action: async () => {
        console.log('Checking dependencies...');
        try {
          execSync('npm run deps', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.yellow('\n⚠️  Some dependency issues found. Please review the output above.'));
        }
      },
      priority: 3
    });

    // Verify project integrity
    this.checks.push({
      name: 'Project Verification',
      condition: () => this.shouldVerifyProject(),
      action: async () => {
        console.log('Running verification...');
        try {
          execSync('npm run verify', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.yellow('\n⚠️  Some verification issues found. Please review the output above.'));
        }
      },
      priority: 5
    });

    // Check critical paths
    this.checks.push({
      name: 'Critical Path Analysis',
      condition: () => this.shouldCheckCriticalPaths(),
      action: async () => {
        console.log('Analyzing critical paths...');
        try {
          execSync('npm run critical', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.yellow('\n⚠️  Some critical path issues found. Please review the output above.'));
        }
      },
      priority: 4
    });

    // Monitor feature progress
    this.checks.push({
      name: 'Feature Progress',
      condition: () => this.shouldCheckFeatureProgress(),
      action: async () => {
        console.log('Checking feature progress...');
        this.analyzeFeatureProgress();
      },
      priority: 2
    });

    // Check Git hooks
    this.checks.push({
      name: 'Git Hooks Verification',
      condition: () => this.shouldVerifyGitHooks(),
      action: async () => {
        console.log('Verifying Git hooks...');
        try {
          execSync('npm run hooks:verify', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.yellow('\n⚠️  Some Git hook issues found. Please review the output above.'));
        }
      },
      priority: 1
    });
  }

  private shouldCheckDependencies(): boolean {
    // Check dependencies if not checked in the last 24 hours
    const lastCheck = this.getLastCheckTime('dependencies');
    return Date.now() - lastCheck > 24 * 60 * 60 * 1000;
  }

  private shouldVerifyProject(): boolean {
    // Verify project if there are pending features
    const state = projectState.getState();
    return Object.values(state.projectDefinition.pages).some(page =>
      page.features.some(f => f.status === 'in-progress')
    );
  }

  private shouldCheckCriticalPaths(): boolean {
    // Check critical paths daily
    const lastCheck = this.getLastCheckTime('criticalPaths');
    return Date.now() - lastCheck > 24 * 60 * 60 * 1000;
  }

  private shouldCheckFeatureProgress(): boolean {
    // Always check feature progress
    return true;
  }

  private shouldVerifyGitHooks(): boolean {
    // Verify hooks weekly
    const lastCheck = this.getLastCheckTime('gitHooks');
    return Date.now() - lastCheck > 7 * 24 * 60 * 60 * 1000;
  }

  private getLastCheckTime(checkType: string): number {
    try {
      const state = projectState.getState();
      return new Date(state.integrations[checkType]?.lastChecked || 0).getTime();
    } catch {
      return 0;
    }
  }

  private analyzeFeatureProgress(): void {
    const state = projectState.getState();
    let completed = 0;
    let total = 0;

    Object.values(state.projectDefinition.pages).forEach(page => {
      page.features.forEach(feature => {
        total++;
        if (feature.status === 'completed') completed++;
      });
    });

    const progress = (completed / total) * 100;
    console.log(`Overall Progress: ${progress.toFixed(1)}%`);
    console.log(`Completed Features: ${completed}/${total}`);

    if (progress < 30) {
      console.log(chalk.yellow('⚠️ Project progress is behind schedule'));
    } else if (progress > 70) {
      console.log(chalk.green('✅ Project is progressing well'));
    }
  }
}

module.exports = {
  NexusBrain
}; 