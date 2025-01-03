import { projectState } from './state/project-state';
import chalk from 'chalk';

interface MilestoneStatus {
  name: string;
  progress: number;
  completed: number;
  total: number;
  remainingDays: number;
  blockers: string[];
}

export class MilestoneTracker {
  generateProgressReport(): string {
    const state = projectState.getState();
    const features = this.getFeatureStats();
    const milestones = this.getMilestones();
    
    let report = '\n📈 Project Progress Report\n\n';
    
    // Overall Progress
    report += chalk.yellow('Overall Progress\n');
    report += `Phase: ${state.currentPhase}\n`;
    report += `Features: ${features.completed}/${features.total} (${Math.round(features.progress)}%)\n\n`;
    
    // Milestones
    report += chalk.yellow('Milestones\n');
    milestones.forEach(milestone => {
      const icon = milestone.progress === 100 ? '✅' : 
                   milestone.progress > 50 ? '🟡' : '🔴';
      report += `${icon} ${milestone.name}: ${milestone.progress}%\n`;
      if (milestone.blockers.length > 0) {
        report += chalk.red(`   Blockers: ${milestone.blockers.join(', ')}\n`);
      }
    });
    
    return report;
  }

  getMilestoneStatus(name: string): MilestoneStatus | null {
    const milestones = this.getMilestones();
    return milestones.find(m => m.name === name) || null;
  }

  private getFeatureStats() {
    const state = projectState.getState();
    let total = 0;
    let completed = 0;

    Object.values(state.projectDefinition.pages).forEach(page => {
      page.features.forEach(feature => {
        total++;
        if (feature.status === 'completed') completed++;
      });
    });

    return {
      total,
      completed,
      progress: (completed / total) * 100
    };
  }

  private getMilestones(): MilestoneStatus[] {
    const state = projectState.getState();
    const milestones: MilestoneStatus[] = [];

    // Group features by priority to create milestones
    const priorities = ['high', 'medium', 'low'] as const;
    
    priorities.forEach(priority => {
      const features = this.getFeaturesForPriority(priority);
      if (features.total > 0) {
        milestones.push({
          name: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Features`,
          progress: (features.completed / features.total) * 100,
          completed: features.completed,
          total: features.total,
          remainingDays: this.estimateRemainingDays(features.remaining),
          blockers: this.findBlockers(priority)
        });
      }
    });

    return milestones;
  }

  private getFeaturesForPriority(priority: 'high' | 'medium' | 'low') {
    const state = projectState.getState();
    let total = 0;
    let completed = 0;
    let remaining: string[] = [];

    Object.values(state.projectDefinition.pages).forEach(page => {
      page.features.forEach(feature => {
        if (feature.priority === priority) {
          total++;
          if (feature.status === 'completed') {
            completed++;
          } else {
            remaining.push(feature.name);
          }
        }
      });
    });

    return { total, completed, remaining };
  }

  private estimateRemainingDays(remainingFeatures: string[]): number {
    // Rough estimate: 2 days per remaining feature
    return remainingFeatures.length * 2;
  }

  private findBlockers(priority: string): string[] {
    const state = projectState.getState();
    const blockers: string[] = [];

    Object.values(state.projectDefinition.pages).forEach(page => {
      page.features.forEach(feature => {
        if (feature.priority === priority && feature.status === 'in-progress') {
          // In a real app, you might check dependencies, resources, etc.
          // For now, we'll just flag features that have been "in-progress" too long
          blockers.push(`${feature.name} (in progress)`);
        }
      });
    });

    return blockers;
  }
} 