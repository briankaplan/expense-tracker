const chalk = require('chalk');
const { execSync } = require('child_process');
const { PROJECT_DEFINITION } = require('../project-roadmap');
const { MilestoneTracker } = require('../milestone-tracker');
const { MilestoneNotifier } = require('../notifications/milestone-notifications');
const { projectState } = require('../state/project-state');
const { sessionManager } = require('../session-state');

interface AutomationRule {
  condition: (milestone: any, status: any) => boolean;
  action: (milestone: any) => void;
  description: string;
}

class MilestoneAutomation {
  private tracker: any;
  private notifier: any;

  constructor() {
    this.tracker = new MilestoneTracker();
    this.notifier = new MilestoneNotifier();
  }

  private automationRules: AutomationRule[] = [
    {
      description: 'Auto-start milestone when dependencies are completed',
      condition: (milestone, status) => {
        if (milestone.status !== 'pending') return false;
        if (!milestone.dependencies?.length) return false;
        
        return milestone.dependencies.every(dep => {
          const depMilestone = this.findMilestone(dep);
          return depMilestone?.status === 'completed';
        });
      },
      action: (milestone) => {
        milestone.status = 'in-progress';
        console.log(chalk.green(`🚀 Auto-started milestone: ${milestone.name}`));
      }
    },
    {
      description: 'Auto-complete milestone when all features are done',
      condition: (milestone, status) => {
        return milestone.status === 'in-progress' && 
               status.progress === 100 &&
               status.blockers.length === 0;
      },
      action: (milestone) => {
        milestone.status = 'completed';
        console.log(chalk.green(`✅ Auto-completed milestone: ${milestone.name}`));
        this.triggerPostCompletion(milestone);
      }
    },
    {
      description: 'Auto-update feature status based on git changes',
      condition: (milestone, status) => {
        return milestone.status === 'in-progress' && 
               this.hasRecentChanges(milestone.features);
      },
      action: (milestone) => {
        this.updateFeatureProgress(milestone);
      }
    }
  ];

  runAutomation(): void {
    console.log(chalk.blue('\n⚙️ Running Milestone Automation\n'));
    let actionsPerformed = 0;

    PROJECT_DEFINITION.phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        const status = this.tracker.getMilestoneStatus(milestone.name);
        if (!status) return;

        this.automationRules.forEach(rule => {
          if (rule.condition(milestone, status)) {
            rule.action(milestone);
            actionsPerformed++;
          }
        });
      });
    });

    if (actionsPerformed > 0) {
      this.saveState();
      this.notifier.displayNotifications();
    } else {
      console.log(chalk.gray('No automation actions needed'));
    }
  }

  private findMilestone(name: string): any {
    for (const phase of PROJECT_DEFINITION.phases) {
      const milestone = phase.milestones.find(m => m.name === name);
      if (milestone) return milestone;
    }
    return null;
  }

  private hasRecentChanges(features: string[]): boolean {
    try {
      const recentChanges = execSync('git diff --name-only HEAD~1')
        .toString()
        .split('\n')
        .filter(Boolean);

      return features.some(feature => 
        recentChanges.some(change => 
          change.toLowerCase().includes(feature.toLowerCase().replace(/\s+/g, '-'))
        )
      );
    } catch (error) {
      return false;
    }
  }

  private updateFeatureProgress(milestone: any): void {
    milestone.features.forEach(feature => {
      const featureFiles = this.getFeatureFiles(feature);
      const completion = this.calculateFeatureCompletion(featureFiles);
      
      if (completion >= 90) {
        projectState.updateFeatureStatus('', feature, 'completed');
        console.log(chalk.green(`✅ Auto-completed feature: ${feature}`));
      } else if (completion >= 20) {
        projectState.updateFeatureStatus('', feature, 'in-progress');
        console.log(chalk.blue(`🔄 Updated feature progress: ${feature} (${completion}%)`));
      }
    });
  }

  private getFeatureFiles(feature: string): string[] {
    try {
      return execSync(`git ls-files | grep -i "${feature.toLowerCase().replace(/\s+/g, '-')}"`)
        .toString()
        .split('\n')
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private calculateFeatureCompletion(files: string[]): number {
    if (files.length === 0) return 0;
    
    let totalLines = 0;
    let completedLines = 0;

    files.forEach(file => {
      try {
        const content = execSync(`git show HEAD:${file}`).toString();
        const lines = content.split('\n');
        totalLines += lines.length;
        completedLines += lines.filter(line => 
          !line.trim().startsWith('//') && 
          !line.trim().startsWith('TODO:') &&
          line.trim().length > 0
        ).length;
      } catch (error) {
        // File might not exist in HEAD
      }
    });

    return totalLines === 0 ? 0 : Math.round((completedLines / totalLines) * 100);
  }

  private triggerPostCompletion(milestone: any): void {
    // Run any necessary scripts
    try {
      execSync(`npm run verify:full`, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Post-completion verification failed'));
    }

    // Update session state
    sessionManager.addDecision(
      `Milestone ${milestone.name} completed`,
      `Automated completion based on feature status and verification`
    );
  }

  private saveState(): void {
    projectState.updateState({
      projectDefinition: PROJECT_DEFINITION
    });
  }
}

module.exports = {
  MilestoneAutomation
}; 