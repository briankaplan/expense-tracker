const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { TRACKED_FEATURES } = require('./track-development');

interface NextStep {
  feature: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  estimatedTime: string;
}

const NEXT_STEPS: NextStep[] = [
  {
    feature: 'OpenReport',
    priority: 'high',
    dependencies: ['ReportDetails', 'ReceiptMatcher'],
    estimatedTime: '3-4 hours'
  },
  {
    feature: 'ReceiptMatcher',
    priority: 'high',
    dependencies: ['BatchUploader'],
    estimatedTime: '4-5 hours'
  }
];

function showNextSteps() {
  const pendingFeatures = Object.entries(TRACKED_FEATURES)
    .filter(([_, feature]) => feature.status === 'pending')
    .map(([name]) => name);

  const nextSteps = NEXT_STEPS
    .filter(step => pendingFeatures.includes(step.feature))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  console.log(chalk.blue('\n📋 Next Development Steps:\n'));
  nextSteps.forEach(step => {
    console.log(chalk.green(`Feature: ${step.feature}`));
    console.log(`Priority: ${step.priority}`);
    console.log(`Est. Time: ${step.estimatedTime}`);
    console.log(`Dependencies: ${step.dependencies.join(', ')}\n`);
  });
}

showNextSteps(); 