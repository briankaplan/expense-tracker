import { projectState } from './state/project-state';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface FileMapping {
  pattern: RegExp | string;
  features: {
    page: string;
    feature: string;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
}

const FILE_MAPPINGS: FileMapping[] = [
  // Reports Features
  {
    pattern: /src\/components\/views\/reports\/(ReportsView|OpenReport)\.tsx/,
    features: [
      { page: 'reports', feature: 'Report Creation', status: 'in-progress' },
      { page: 'reports', feature: 'Report Summary', status: 'in-progress' }
    ]
  },
  {
    pattern: /src\/components\/views\/reports\/ReceiptMatcher\.tsx/,
    features: [
      { page: 'reports', feature: 'Receipt Validation', status: 'in-progress' },
      { page: 'receipts', feature: 'OCR Processing', status: 'in-progress' }
    ]
  },

  // Expenses Features
  {
    pattern: /src\/components\/views\/expenses\/ExpenseManagerView\.tsx/,
    features: [
      { page: 'expenses', feature: 'Manual Entry', status: 'in-progress' },
      { page: 'dashboard', feature: 'Recent Expenses Overview', status: 'in-progress' }
    ]
  },
  {
    pattern: 'src/lib/teller-api',
    features: [
      { page: 'expenses', feature: 'Live Bank Feed', status: 'in-progress' },
      { page: 'settings', feature: 'Bank Integration', status: 'in-progress' }
    ]
  },

  // Receipt Features
  {
    pattern: /src\/components\/views\/receipts\/(BatchUploader|ReceiptViewer)\.tsx/,
    features: [
      { page: 'receipts', feature: 'Batch Upload', status: 'in-progress' },
      { page: 'receipts', feature: 'OCR Processing', status: 'in-progress' }
    ]
  },
  {
    pattern: 'src/lib/gmail-plugin',
    features: [
      { page: 'receipts', feature: 'Gmail Plugin', status: 'in-progress' },
      { page: 'settings', feature: 'Plugin Management', status: 'in-progress' }
    ]
  },

  // Integration Features
  {
    pattern: 'src/lib/mindee',
    features: [
      { page: 'receipts', feature: 'OCR Processing', status: 'in-progress' }
    ]
  },
  {
    pattern: 'src/lib/chatgpt',
    features: [
      { page: 'expenses', feature: 'Auto Categorization', status: 'in-progress' }
    ]
  }
];

async function autoTrack() {
  console.log(chalk.blue('\n🔄 Running Automated Project Tracking\n'));

  try {
    // Check git changes
    const changedFiles = execSync('git diff --cached --name-only')
      .toString()
      .split('\n')
      .filter(Boolean);

    // Track affected features
    const affectedFeatures = new Set<string>();

    // Update feature status based on changed files
    changedFiles.forEach(file => {
      const updates = updateFeatureFromFile(file);
      updates.forEach(feature => affectedFeatures.add(feature));
    });

    // Run verifications
    await execSync('npm run verify:full', { stdio: 'inherit' });

    // Generate and save report
    const report = generateTrackingReport(Array.from(affectedFeatures));
    console.log(report);

    // Update project state with changes
    projectState.addVerification('auto-track', 'success', {
      changedFiles,
      affectedFeatures: Array.from(affectedFeatures)
    });

  } catch (error) {
    console.error(chalk.red('\n❌ Automated tracking failed:'), error);
    projectState.addVerification('auto-track', 'failure', { error: error.toString() });
    process.exit(1);
  }
}

function updateFeatureFromFile(file: string): string[] {
  const affectedFeatures: string[] = [];

  FILE_MAPPINGS.forEach(mapping => {
    const matches = typeof mapping.pattern === 'string' 
      ? file.includes(mapping.pattern)
      : mapping.pattern.test(file);

    if (matches) {
      mapping.features.forEach(({ page, feature, status }) => {
        projectState.updateFeatureStatus(page, feature, status);
        affectedFeatures.push(`${page}:${feature}`);
      });
    }
  });

  return affectedFeatures;
}

function generateTrackingReport(affectedFeatures: string[]): string {
  let report = chalk.blue('\n📊 Tracking Report\n\n');

  if (affectedFeatures.length > 0) {
    report += chalk.yellow('Updated Features:\n');
    affectedFeatures.forEach(feature => {
      const [page, name] = feature.split(':');
      report += `  - ${page}: ${name}\n`;
    });
  } else {
    report += chalk.gray('No features were affected by these changes\n');
  }

  const state = projectState.getState();
  report += `\nLast Updated: ${state.lastUpdated}\n`;
  report += `Current Phase: ${state.currentPhase}\n`;

  return report;
}

module.exports = {
  autoTrack,
  updateFeatureFromFile,
  generateTrackingReport
}; 