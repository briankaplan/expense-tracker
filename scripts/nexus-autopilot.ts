(async () => {
    const chalk = (await import('chalk')).default; // Use dynamic import
    console.log(chalk.green('Nexus Autopilot initialized!'));
  })();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// OpenAI setup
const { OpenAI } = require('openai'); // Fixed import for OpenAI

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Logger utility
const log = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  const colors = { success: chalk.green, error: chalk.red, info: chalk.blue };
  console.log(colors[type](`[${type.toUpperCase()}] ${msg}`));
};

// Backup scripts
const backupScripts = () => {
  log('Backing up scripts and configs...', 'info');
  fs.mkdirSync('./backups', { recursive: true });
  execSync('cp -r scripts backups/scripts_backup');
  execSync('cp package.json backups/package.json.backup');
  log('Backup completed.', 'success');
};

// Restore scripts
const restoreScripts = () => {
  log('Restoring scripts from backup...', 'info');
  execSync('cp -r backups/scripts_backup/* scripts/');
  execSync('cp backups/package.json.backup package.json');
  log('Restore completed.', 'success');
};

// AI Auto-Fix
const analyzeAndFix = async (logContent: string) => {
  log('Analyzing logs for issues...', 'info');

  const prompt = `
    Analyze this log and suggest fixes:
    ${logContent}
    Provide the exact code or commands needed to resolve the problem.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });

  const suggestion = response.choices[0]?.message?.content || 'No suggestions.';
  log('AI Suggestion:', 'info');
  console.log(suggestion);

  // Apply fixes
  if (suggestion.includes('npm install')) {
    execSync(suggestion, { stdio: 'inherit' });
    log('Dependency fixed!', 'success');
  } else if (suggestion.includes('npx ts-node')) {
    execSync(suggestion, { stdio: 'inherit' });
    log('Script executed successfully!', 'success');
  } else {
    log('No direct fix available. Manual review needed.', 'error');
  }
};

// Dependency checks
const checkDependencies = () => {
  log('Checking dependencies...', 'info');
  try {
    const outdated = execSync('npm outdated').toString();
    if (outdated) {
      log('Outdated dependencies detected:', 'error');
      console.log(outdated);
    } else {
      log('All dependencies are up-to-date.', 'success');
    }
  } catch (err) {
    log('Dependency check failed.', 'error');
  }
};

// File structure validation
const validateStructure = () => {
  log('Validating folder structure...', 'info');
  const allowedFolders = ['./src', './scripts', './components', './config'];
  fs.readdirSync('.').forEach((folder) => {
    if (!allowedFolders.includes(`./${folder}`) && fs.lstatSync(folder).isDirectory()) {
      log(`Unexpected folder detected: ${folder}`, 'error');
      execSync(`mv ${folder} ./scripts/`, { stdio: 'inherit' });
      log(`Moved ${folder} to ./scripts/`, 'success');
    }
  });
};

// AutoPilot execution
const autoPilot = async () => {
  log('Starting Nexus Autopilot...', 'info');

  // Backup first
  backupScripts();

  // Check dependencies
  checkDependencies();

  // Verify all scripts
  try {
    execSync('npx ts-node scripts/verify-all.ts', { stdio: 'inherit' });
  } catch (error) {
    log('Verification failed! Analyzing...', 'error');
    const logContent = fs.existsSync('logs/ai_changes.log')
      ? fs.readFileSync('logs/ai_changes.log', 'utf8')
      : 'Log file missing.';
    await analyzeAndFix(logContent);
  }

  // Validate structure
  validateStructure();

  // Final verification
  log('Re-running verification...', 'info');
  execSync('npx ts-node scripts/verify-all.ts', { stdio: 'inherit' });

  log('Nexus Autopilot completed successfully.', 'success');
};

// Start AutoPilot
autoPilot();