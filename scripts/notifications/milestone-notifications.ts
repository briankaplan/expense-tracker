import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { sessionManager } from '../session-state';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export class MilestoneNotifier {
  private readonly notificationsPath: string;
  private notifications: Notification[];

  constructor() {
    this.notificationsPath = path.join(process.cwd(), 'logs', 'notifications.json');
    this.notifications = this.loadNotifications();
  }

  private loadNotifications(): Notification[] {
    try {
      if (fs.existsSync(this.notificationsPath)) {
        return JSON.parse(fs.readFileSync(this.notificationsPath, 'utf8'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Failed to load notifications:'), error.message);
      }
    }
    return [];
  }

  private saveNotifications(): void {
    try {
      fs.writeFileSync(this.notificationsPath, JSON.stringify(this.notifications, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Failed to save notifications:'), error.message);
      }
    }
  }

  async start(): Promise<void> {
    try {
      console.log(chalk.blue('\n🔔 Starting Milestone Notifier\n'));
      await this.checkMilestones();
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Failed to start milestone notifier:'), error.message);
        throw error;
      }
    }
  }

  private async checkMilestones(): Promise<void> {
    const context = sessionManager.getCurrentContext();
    const pendingTasks = context.pendingTasks || [];

    if (pendingTasks.length > 0) {
      this.addNotification({
        type: 'info',
        message: `You have ${pendingTasks.length} pending tasks.`,
      });
    }

    this.displayNotifications();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...notification,
    };

    this.notifications.push(newNotification);
    this.saveNotifications();
    this.displayNotification(newNotification);
  }

  private displayNotification(notification: Notification): void {
    const icon = notification.type === 'error' ? '❌' :
                notification.type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${notification.message}`);
  }

  displayNotifications(): void {
    if (this.notifications.length === 0) {
      console.log(chalk.blue('\nNo notifications\n'));
      return;
    }

    console.log(chalk.blue('\n📬 Notifications\n'));
    this.notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach(notification => this.displayNotification(notification));
  }

  clearNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    console.log(chalk.green('\n✨ Notifications cleared\n'));
  }
} 