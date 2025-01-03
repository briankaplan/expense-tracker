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
const fs = require('fs');
const path = require('path');

function setupCommands() {
  program
    .name('nexus')
    .description('Nexus Development Control Center')
    .version('1.0.0');

  // Fix command definitions to handle arguments properly
  program
    .command('dashboard')
    .alias('d')
    .description('Open development dashboard')
    .action(() => {
      const dashboard = new DevelopmentDashboard();
      dashboard.generateDashboard();
    });

  program
    .command('status')
    .alias('s')
    .description('Show current development status')
    .action(() => {
      console.log(sessionManager.generateSessionSummary());
    });

  program
    .command('verify')
    .alias('v')
    .description('Run verification checks')
    .action(() => {
      execSync('npm run verify:full', { stdio: 'inherit' });
    });

  program
    .command('milestones')
    .alias('m')
    .description('Show milestone progress')
    .action(() => {
      const tracker = new MilestoneTracker();
      console.log(tracker.generateProgressReport());
    });

  program
    .command('milestone')
    .argument('<name>')
    .description('Show specific milestone details')
    .action((name) => {
      const tracker = new MilestoneTracker();
      const status = tracker.getMilestoneStatus(name);
      if (status) {
        console.log(chalk.blue(`\n📊 Milestone: ${name}\n`));
        console.log(`Progress: ${status.progress}%`);
        console.log(`Features: ${status.completed}/${status.total}`);
        console.log(`Days Left: ${status.remainingDays}`);
        if (status.blockers.length > 0) {
          console.log(chalk.red(`Blockers: ${status.blockers.join(', ')}`));
        }
      } else {
        console.log(chalk.red(`Milestone "${name}" not found`));
      }
    });

  program
    .command('alerts')
    .alias('a')
    .description('Show milestone alerts')
    .action(() => {
      const notifier = new MilestoneNotifier();
      notifier.displayNotifications();
    });

  program
    .command('auto')
    .alias('au')
    .description('Run milestone automation')
    .action(() => {
      const automation = new MilestoneAutomation();
      automation.runAutomation();
    });

  // Add feature management
  program
    .command('feature')
    .alias('f')
    .description('Manage features')
    .argument('<name>', 'Feature name')
    .option('-s, --status <status>', 'Update status (pending/in-progress/completed)')
    .option('-p, --priority <priority>', 'Set priority (high/medium/low)')
    .option('-i, --info', 'Show feature info')
    .action((name, options) => {
      if (options.info) {
        // Show feature details
        const feature = projectState.getFeatureDetails(name);
        if (feature) {
          console.log(chalk.blue(`\n📋 Feature: ${name}\n`));
          console.log(`Status: ${feature.status}`);
          console.log(`Priority: ${feature.priority}`);
          console.log(`Progress: ${feature.progress}%`);
          console.log(`Dependencies: ${feature.dependencies?.join(', ') || 'None'}`);
        } else {
          console.log(chalk.red(`Feature "${name}" not found`));
        }
      } else if (options.status) {
        // Update feature status
        projectState.updateFeatureStatus('', name, options.status);
        console.log(chalk.green(`Updated status of "${name}" to ${options.status}`));
      }
    });

  // Add integration management
  program
    .command('integration')
    .alias('i')
    .description('Manage integrations')
    .argument('[name]', 'Integration name')
    .option('-c, --check', 'Check integration status')
    .option('-t, --test', 'Run integration tests')
    .action((name, options) => {
      if (options.check) {
        const status = projectState.getIntegrationStatus(name);
        console.log(chalk.blue(`\n🔌 Integration Status: ${name}\n`));
        console.log(`Status: ${status?.status || 'unknown'}`);
        console.log(`Last Checked: ${status?.lastChecked || 'never'}`);
      }
    });

  // Add report generation
  program
    .command('report')
    .alias('r')
    .description('Generate reports')
    .option('-t, --type <type>', 'Report type (progress/status/metrics)')
    .option('-f, --format <format>', 'Output format (text/json/markdown)')
    .action((options) => {
      const dashboard = new DevelopmentDashboard();
      const data = dashboard.generateReport(options.type, options.format);
      console.log(data);
    });

  // Add sync management
  program
    .command('sync')
    .alias('sy')
    .description('Manage state synchronization')
    .option('-s, --start', 'Start sync service')
    .option('-x, --stop', 'Stop sync service')
    .option('-c, --check', 'Check sync status')
    .action((options) => {
      if (options.start) {
        stateSync.start();
      } else if (options.stop) {
        stateSync.stop();
      } else if (options.check) {
        const status = stateSync.getStatus();
        console.log(chalk.blue('\n🔄 Sync Status\n'));
        console.log(`Active: ${status.active}`);
        console.log(`Last Sync: ${status.lastSync}`);
        console.log(`Next Sync: ${status.nextSync}`);
      }
    });

  // Add development tools
  program
    .command('tools')
    .alias('t')
    .description('Development tools')
    .option('-c, --clean', 'Clean development environment')
    .option('-b, --backup', 'Create backup')
    .option('-v, --validate', 'Validate project structure')
    .action((options) => {
      if (options.clean) {
        execSync('npm run cleanup', { stdio: 'inherit' });
      } else if (options.backup) {
        recoveryManager.createRecoveryPoint('manual');
      } else if (options.validate) {
        execSync('npm run verify:structure', { stdio: 'inherit' });
      }
    });

  // Add help command
  program
    .command('help')
    .description('Show Nexus commands')
    .action(() => {
      console.log(chalk.blue('\n📚 Nexus Command Reference\n'));
      program.help();
    });

  // Add AI assistant
  program
    .command('ai')
    .description('AI development assistant')
    .argument('<action>', 'Action to perform (suggest/analyze/improve/next/resume)')
    .argument('[input]', 'Input for the action (query or file path)')
    .action(async (action, input) => {
      const assistant = new AIAssistant();
      let response;

      switch (action) {
        case 'resume':
          response = await assistant.resume();
          break;
        case 'next':
          response = await assistant.getNextSteps();
          break;
        case 'suggest':
          response = await assistant.suggest(input || '');
          break;
        case 'analyze':
          response = await assistant.analyze(input);
          break;
        case 'improve':
          response = await assistant.improve(input);
          break;
        default:
          console.log(chalk.red('Unknown action. Use suggest, analyze, or improve'));
          return;
      }

      // Display response
      console.log(chalk.green(`\n💡 ${response.suggestion}\n`));
      console.log(chalk.gray(response.explanation));

      if (response.code) {
        console.log(chalk.yellow('\nSuggested Code:'));
        console.log(response.code);
      }

      if (response.nextSteps) {
        console.log(chalk.blue('\nNext Steps:'));
        response.nextSteps.forEach((step, i) => {
          console.log(`${i + 1}. ${step}`);
        });
      }

      if (response.updates) {
        console.log(chalk.yellow('\nSuggested Updates:'));
        response.updates.forEach(update => {
          const icon = update.type === 'feature' ? '🔨' :
                      update.type === 'test' ? '🧪' : '📝';
          console.log(`${icon} ${update.file}`);
          console.log(chalk.gray(`   ${update.description}`));
        });
      }
    });

  // Add script verification
  program
    .command('verify-scripts')
    .alias('vs')
    .description('Verify script system integrity')
    .action(async () => {
      const verifier = new ScriptVerifier();
      await verifier.verifyAllScripts();
    });

  // Add impact analysis
  program
    .command('impact')
    .alias('imp')
    .description('Analyze impact of recent changes')
    .action(async () => {
      const analyzer = new ImpactAnalyzer();
      await analyzer.analyzeChanges();
    });

  // Add dependency checking
  program
    .command('deps')
    .alias('dp')
    .description('Check project dependencies')
    .action(async () => {
      const checker = new DependencyChecker();
      await checker.checkDependencies();
    });

  // Add critical path monitoring
  program
    .command('critical')
    .alias('cp')
    .description('Monitor critical paths')
    .action(async () => {
      const monitor = new CriticalPathMonitor();
      await monitor.monitor();
    });

  // Add smart brain
  program
    .command('brain')
    .alias('b')
    .description('Run Nexus Brain to automatically check and run needed commands')
    .action(async () => {
      const brain = new NexusBrain();
      await brain.checkAndRun();
    });

  // Add hooks management
  program
    .command('hooks')
    .alias('h')
    .description('Manage Git hooks')
    .option('-i, --install', 'Install Git hooks')
    .option('-v, --verify', 'Verify Git hooks')
    .action((options) => {
      const manager = new GitHooksManager();
      if (options.install) {
        manager.installHooks();
      } else if (options.verify) {
        manager.verifyHooks();
      } else {
        console.log(chalk.yellow('Use --install or --verify'));
      }
    });

  return program;
}

// Run Nexus
try {
  // Check if system is initialized
  const requiredFiles = ['.project-state.json', '.session-state.json'];
  const missing = requiredFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  
  if (missing.length > 0) {
    console.log(chalk.yellow('\n⚠️ Nexus system not initialized. Running initialization...\n'));
    execSync('npm run init:nexus', { stdio: 'inherit' });
  }

  setupCommands().parse();
} catch (error) {
  console.error(chalk.red('\n❌ Nexus command failed:'), error);
  console.log(chalk.yellow('\nTry running: npm run init:nexus'));
  process.exit(1);
} 