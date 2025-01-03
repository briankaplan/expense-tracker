const chalk = require('chalk');
const { MilestoneTracker } = require('../milestone-tracker');
const { sessionManager } = require('../session-state');
const { PROJECT_DEFINITION } = require('../project-roadmap');

interface MilestoneAlert {
  type: 'warning' | 'critical' | 'info';
  message: string;
  milestone: string;
  daysUntilDue?: number;
}

class MilestoneNotifier {
  private tracker: any;
  private readonly WARNING_THRESHOLD = 7; // Days before deadline to warn
  private readonly CRITICAL_THRESHOLD = 3; // Days before deadline for critical alert

  constructor() {
    this.tracker = new MilestoneTracker();
  }

  checkNotifications(): MilestoneAlert[] {
    const alerts: MilestoneAlert[] = [];
    
    // Check each milestone
    for (const phase of PROJECT_DEFINITION.phases) {
      for (const milestone of phase.milestones) {
        if (milestone.status === 'completed') continue;

        const status = this.tracker.getMilestoneStatus(milestone.name);
        if (!status) continue;

        // Check deadline proximity
        if (status.remainingDays <= this.CRITICAL_THRESHOLD && status.remainingDays > 0) {
          alerts.push({
            type: 'critical',
            message: `Critical: ${milestone.name} due in ${status.remainingDays} days`,
            milestone: milestone.name,
            daysUntilDue: status.remainingDays
          });
        } else if (status.remainingDays <= this.WARNING_THRESHOLD && status.remainingDays > this.CRITICAL_THRESHOLD) {
          alerts.push({
            type: 'warning',
            message: `Warning: ${milestone.name} due in ${status.remainingDays} days`,
            milestone: milestone.name,
            daysUntilDue: status.remainingDays
          });
        }

        // Check blockers
        if (status.blockers.length > 0) {
          alerts.push({
            type: 'warning',
            message: `Blockers found for ${milestone.name}: ${status.blockers.join(', ')}`,
            milestone: milestone.name
          });
        }

        // Check progress
        if (status.progress < 30 && status.remainingDays < 14) {
          alerts.push({
            type: 'warning',
            message: `Low progress on ${milestone.name}: ${status.progress}% with ${status.remainingDays} days remaining`,
            milestone: milestone.name
          });
        }
      }
    }

    return alerts;
  }

  displayNotifications(): void {
    const alerts = this.checkNotifications();
    if (alerts.length === 0) {
      console.log(chalk.green('\n✅ No milestone alerts\n'));
      return;
    }

    console.log(chalk.yellow('\n🔔 Milestone Alerts\n'));
    
    // Group by type
    const critical = alerts.filter(a => a.type === 'critical');
    const warnings = alerts.filter(a => a.type === 'warning');
    const info = alerts.filter(a => a.type === 'info');

    // Display critical first
    if (critical.length > 0) {
      console.log(chalk.red('Critical Alerts:'));
      critical.forEach(alert => {
        console.log(chalk.red(`❗ ${alert.message}`));
      });
      console.log('');
    }

    // Then warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow('Warnings:'));
      warnings.forEach(alert => {
        console.log(chalk.yellow(`⚠️  ${alert.message}`));
      });
      console.log('');
    }

    // Then info
    if (info.length > 0) {
      console.log(chalk.blue('Information:'));
      info.forEach(alert => {
        console.log(chalk.blue(`ℹ️  ${alert.message}`));
      });
      console.log('');
    }

    // Save to session state
    sessionManager.updateState({
      currentContext: {
        ...sessionManager.getCurrentContext(),
        milestoneAlerts: alerts
      }
    });
  }
}

module.exports = {
  MilestoneNotifier
}; 