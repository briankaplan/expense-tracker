const { projectState } = require('./state/project-state');
const chalk = require('chalk');
const asciichart = require('asciichart');

interface DashboardData {
  projectStatus: {
    phase: string;
    features: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

class DevelopmentDashboard {
  async generateDashboard(): Promise<void> {
    const data = await this.collectData();
    this.displayDashboard(data);
  }

  private async collectData(): Promise<DashboardData> {
    const state = projectState.getState();
    const features = this.collectFeatureStats();
    const recentActivity = await this.getRecentActivity();
    const alerts = this.generateAlerts(features);

    return {
      projectStatus: {
        phase: state.currentPhase,
        features
      },
      recentActivity,
      alerts
    };
  }

  private collectFeatureStats() {
    const state = projectState.getState();
    const features = {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0
    };

    Object.values(state.projectDefinition.pages).forEach(page => {
      page.features.forEach(feature => {
        features.total++;
        if (feature.status === 'completed') features.completed++;
        else if (feature.status === 'in-progress') features.inProgress++;
        else features.pending++;
      });
    });

    return features;
  }

  private async getRecentActivity() {
    try {
      const gitLog = execSync('git log --pretty=format:"%h|%s|%ad" -n 5 --date=relative').toString();
      return gitLog.split('\n').map(line => {
        const [hash, message, date] = line.split('|');
        return {
          type: 'commit',
          description: message,
          timestamp: date
        };
      });
    } catch (error) {
      return [];
    }
  }

  private generateAlerts(features: { total: number; completed: number; inProgress: number }) {
    const alerts: DashboardData['alerts'] = [];

    // Check feature progress
    const completionRate = (features.completed / features.total) * 100;
    if (completionRate < 30) {
      alerts.push({
        level: 'warning',
        message: 'Project completion rate is low'
      });
    }

    // Check stale features
    if (features.inProgress > 3) {
      alerts.push({
        level: 'warning',
        message: 'Multiple features in progress - consider focusing on completion'
      });
    }

    return alerts;
  }

  private displayDashboard(data: DashboardData): void {
    console.clear();
    console.log(chalk.blue('\n📊 Development Dashboard\n'));

    // Project Status
    console.log(chalk.yellow('🎯 Project Status'));
    console.log(`Phase: ${data.projectStatus.phase}`);
    console.log(`Features: ${data.projectStatus.features.completed}/${data.projectStatus.features.total} completed`);
    console.log(`In Progress: ${data.projectStatus.features.inProgress}`);
    console.log(`Pending: ${data.projectStatus.features.pending}\n`);

    // Recent Activity
    console.log(chalk.yellow('🔄 Recent Activity'));
    data.recentActivity.forEach(activity => {
      console.log(`${activity.timestamp}: ${activity.description}`);
    });
    console.log();

    // Alerts
    if (data.alerts.length > 0) {
      console.log(chalk.yellow('⚠️ Alerts'));
      data.alerts.forEach(alert => {
        const icon = alert.level === 'error' ? '❌' : 
                    alert.level === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${alert.message}`);
      });
    }
  }
}

module.exports = {
  DevelopmentDashboard
}; 