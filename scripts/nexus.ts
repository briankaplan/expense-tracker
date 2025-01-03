const chalk = require('chalk');
const { execSync } = require('child_process');
const { program } = require('commander');
const { DevelopmentDashboard } = require('./dashboard');
const { stateSync } = require('./sync-manager');
const { recoveryManager } = require('./recovery-manager');
const { sessionManager } = require('./session-state');
const { MilestoneTracker } = require('./milestone-tracker');
const { MilestoneNotifier } = require('./notifications/milestone-notifications');
const { MilestoneAutomation } = require('./automation/milestone-automation');
const { AIAssistant } = require('./ai/assistant');
const { ScriptVerifier } = require('./verify-scripts');
const { ImpactAnalyzer } = require('./analyze-impact');
const { DependencyChecker } = require('./dependency-checker');
const { CriticalPathMonitor } = require('./critical-path-monitor');
const { NexusBrain } = require('./nexus-brain');
const { GitHooksManager } = require('./hooks/git-hooks');
const { projectState } = require('./state/project-state');
const fs = require('fs');
const path = require('path');

interface NexusCommand {
  name: string;
  description: string;
  alias?: string;
  action: (...args: any[]) => Promise<void>;
}

interface NexusConfig {
  commands: NexusCommand[];
  hooks: string[];
  automations: string[];
}

function setupCommands() {
  program
    .name('nexus')
    .description('Nexus Development Control Center')
    .version('1.0.0');

  // Add brain command
  program
    .command('brain')
    .alias('b')
    .description('Run Nexus brain checks')
    .action(async () => {
      const brain = new NexusBrain();
      await brain.checkAndRun();
    });

  // ... rest of the commands ...
}

// Set up commands and parse arguments
setupCommands();
program.parse(process.argv);

module.exports = {
  setupCommands
}; 