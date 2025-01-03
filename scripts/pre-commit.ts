import { ImpactAnalyzer } from './dependency-impact';
import { execSync } from 'child_process';
import chalk from 'chalk';
import path from 'path';

export interface PreCommitResult {
  hasHighRisk: boolean;
  changedFiles: string[];
  highRiskFiles: string[];
  impactReports: { [file: string]: string };
}

export async function checkChangedFiles(): Promise<PreCommitResult> {
  const result: PreCommitResult = {
    hasHighRisk: false,
    changedFiles: [],
    highRiskFiles: [],
    impactReports: {}
  };

  // Get changed files
  const changedFiles = execSync('git diff --cached --name-only')
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

  if (changedFiles.length === 0) return result;

  result.changedFiles = changedFiles;

  const analyzer = new ImpactAnalyzer(path.join(process.cwd(), 'src'));
  analyzer.buildDependencyGraph();

  changedFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    const analysis = analyzer.analyzeFileImpact(fullPath);

    if (analysis.riskLevel === 'high') {
      result.hasHighRisk = true;
      result.highRiskFiles.push(file);
      result.impactReports[file] = analyzer.generateImpactReport(fullPath);
      console.warn(chalk.red(`\n⚠️ High-risk changes in: ${file}`));
      console.log(result.impactReports[file]);
    }
  });

  return result;
}

export async function runPreCommit(): Promise<void> {
  try {
    const result = await checkChangedFiles();
    
    if (result.hasHighRisk) {
      console.warn(chalk.yellow('\n⚠️ High-risk changes detected. Please review the impact reports above.'));
      console.log(chalk.blue('You can still commit, but consider:'));
      console.log('1. Breaking the changes into smaller commits');
      console.log('2. Adding more tests for affected components');
      console.log('3. Updating documentation for changed interfaces');
    }
  } catch (error) {
    console.error(chalk.red('Error during pre-commit check:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  runPreCommit().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  });
} 