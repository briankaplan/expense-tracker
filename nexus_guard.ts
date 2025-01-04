import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// --- CONFIGURATION ---
const ALLOWED_DIRS = [
    './src',
    './app',
    './config',
    './scripts',
    './components',
    './.git',
    './.next',
    './.husky',
    './node_modules',
    './public',
    './logs',
    './backups',
    './.nexus',
    './.github',
    './docs',
    './downloads',
    './recovery',
    './templates',
    './types',
    './lib'
];
const PROTECTED_FILES = ['.env', './nexus_guard.ts', './config/teller.ts'];
const BACKUP_FOLDER = './backups';
const LOG_FILE = './logs/ai_changes.log';
const CHECKSUM_FILE = './checksums.json';
const ENFORCE_MODE = true; // Enable strict enforcement

// --- UTILITY FUNCTIONS ---
const log = (msg: string, type: 'success' | 'error' | 'info' | 'warning') => {
  const colors = {
    success: chalk.green,
    error: chalk.red,
    info: chalk.blue,
    warning: chalk.yellow
  };
  console.log(colors[type](`[${type.toUpperCase()}] ${msg}`));
};

const getChecksum = (file: string): string => {
  const data = fs.readFileSync(file, 'utf8');
  return crypto.createHash('sha256').update(data).digest('hex');
};

const saveChecksums = (checksums: Record<string, string>) => {
  fs.writeFileSync(CHECKSUM_FILE, JSON.stringify(checksums, null, 2));
  log('Checksums updated.', 'info');
};

// --- VERIFY DIRECTORY STRUCTURE ---
const validateStructure = () => {
  log('Validating folder structure...', 'info');
  const allowed = new Set(ALLOWED_DIRS.map((dir) => path.normalize(dir)));

  fs.readdirSync('.').forEach((item) => {
    const itemPath = path.normalize(`./${item}`);
    if (fs.statSync(itemPath).isDirectory() && !allowed.has(itemPath)) {
      log(`Unauthorized folder detected: ${itemPath}`, 'error');
      if (ENFORCE_MODE) process.exit(1);
    }
  });

  log('Folder structure validated.', 'success');
};

// --- BACKUP FILES ---
const backupFiles = () => {
  log('Backing up critical files...', 'info');
  if (!fs.existsSync(BACKUP_FOLDER)) fs.mkdirSync(BACKUP_FOLDER);

  PROTECTED_FILES.forEach((file) => {
    if (fs.existsSync(file)) {
      const backupPath = path.join(BACKUP_FOLDER, path.basename(file));
      fs.copyFileSync(file, `${backupPath}.backup`);
      log(`Backup created for ${file}`, 'success');
    } else {
      log(`Protected file not found: ${file}`, 'warning');
    }
  });
};

// --- CHECKSUM VALIDATION ---
const validateChecksums = () => {
  log('Validating checksums...', 'info');
  let checksums: Record<string, string> = {};

  if (fs.existsSync(CHECKSUM_FILE)) {
    checksums = JSON.parse(fs.readFileSync(CHECKSUM_FILE, 'utf8'));
  }

  let valid = true;
  PROTECTED_FILES.forEach((file) => {
    if (!fs.existsSync(file)) {
      log(`Protected file not found: ${file}`, 'warning');
      return;
    }

    const checksum = getChecksum(file);
    if (checksums[file] && checksums[file] !== checksum) {
      log(`File tampered: ${file}`, 'error');
      if (ENFORCE_MODE) {
        const backup = `${BACKUP_FOLDER}/${path.basename(file)}.backup`;
        if (fs.existsSync(backup)) {
          fs.copyFileSync(backup, file);
          log(`Restored ${file} from backup.`, 'success');
        } else {
          log(`No backup found for ${file}`, 'error');
        }
      }
      valid = false;
    }
    checksums[file] = checksum; // Update checksum
  });

  fs.writeFileSync(CHECKSUM_FILE, JSON.stringify(checksums, null, 2));
  if (!valid && ENFORCE_MODE) process.exit(1);
};

// --- AI WRITE BLOCKER ---
const monitorWrites = () => {
  const originalWrite = fs.writeFileSync;
  fs.writeFileSync = (file, data, options) => {
    const normalizedPath = path.normalize(file.toString());
    if (!ALLOWED_DIRS.some((dir) => normalizedPath.startsWith(dir))) {
      const logEntry = `${new Date().toISOString()} - BLOCKED AI WRITE: ${normalizedPath}\n`;
      fs.appendFileSync(LOG_FILE, logEntry);
      log(`Blocked AI write: ${normalizedPath}`, 'error');
      if (ENFORCE_MODE) process.exit(1);
    }
    originalWrite(file, data, options);
  };
};

// --- GIT BACKUP ---
const gitBackup = () => {
  try {
    execSync('git add .');
    execSync(`git commit -m "Nexus Auto Backup"`);
    execSync('git push origin main');
    log('Git backup completed.', 'success');
  } catch (err) {
    if (err instanceof Error) {
      log(`Git backup failed: ${err.message}`, 'error');
    } else {
      log('Git backup failed with an unknown error.', 'error');
    }
  }
};

// --- PROTECT NEXUS FILE ---
const protectNexus = () => {
  const nexusFile = './nexus_guard.ts';
  const backupFile = `${BACKUP_FOLDER}/nexus_guard.ts.backup`;

  if (getChecksum(nexusFile) !== getChecksum(backupFile)) {
    log('Nexus script modified!', 'error');
    fs.copyFileSync(backupFile, nexusFile);
    log('Restored Nexus script.', 'success');
  }
};

// --- MAIN EXECUTION ---
const runNexus = () => {
  log('Starting Nexus Guardian...', 'info');

  // Ensure backup and logs folders exist
  if (!fs.existsSync(BACKUP_FOLDER)) fs.mkdirSync(BACKUP_FOLDER);
  if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

  backupFiles();
  protectNexus();
  validateStructure();
  validateChecksums();
  monitorWrites();
  gitBackup();

  log('Nexus Guardian completed successfully.', 'success');
};

// Execute the Guardian
runNexus();