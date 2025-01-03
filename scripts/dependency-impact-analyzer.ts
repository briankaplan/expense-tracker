import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class DependencyImpactAnalyzer {
  async analyze() {
    console.log(chalk.blue('\n🔍 Analyzing Dependency Impact...\n'));

    try {
      // Get package.json content
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Analyze bundle impact
      console.log(chalk.yellow('Analyzing bundle impact...'));
      const buildDir = path.join(process.cwd(), '.next');
      const stats = JSON.parse(fs.readFileSync(path.join(buildDir, 'build-manifest.json'), 'utf8'));

      const depSizes = new Map<string, number>();
      for (const chunk of Object.values<string[]>(stats.pages)) {
        for (const file of chunk) {
          const content = fs.readFileSync(path.join(buildDir, file), 'utf8');
          
          // Check each dependency's presence in the chunk
          for (const dep of Object.keys(allDeps)) {
            if (content.includes(dep)) {
              const currentSize = depSizes.get(dep) || 0;
              depSizes.set(dep, currentSize + content.length);
            }
          }
        }
      }

      // Sort dependencies by impact
      const sortedDeps = Array.from(depSizes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      console.log(chalk.yellow('\nTop 10 Dependencies by Bundle Impact:'));
      sortedDeps.forEach(([dep, size]) => {
        console.log(`- ${dep}: ${(size / 1024).toFixed(2)}KB`);
      });

      // Check for unused dependencies
      console.log(chalk.yellow('\nChecking for unused dependencies...'));
      const depcheck = require('depcheck');
      const unused = await depcheck(process.cwd(), {
        ignoreBinPackage: false,
        skipMissing: false,
        ignorePatterns: ['dist', '.next', 'node_modules']
      });

      if (unused.dependencies.length > 0) {
        console.log(chalk.red('\nUnused Dependencies:'));
        unused.dependencies.forEach(dep => {
          console.log(`- ${dep}`);
        });
      } else {
        console.log(chalk.green('No unused dependencies found!'));
      }

      // Check for security vulnerabilities
      console.log(chalk.yellow('\nChecking for security vulnerabilities...'));
      try {
        execSync('npm audit', { stdio: 'inherit' });
        console.log(chalk.green('No vulnerabilities found!'));
      } catch (error) {
        console.log(chalk.red('Vulnerabilities detected. Please run npm audit fix'));
      }

      // Check for outdated dependencies
      console.log(chalk.yellow('\nChecking for outdated dependencies...'));
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdatedDeps = JSON.parse(outdated || '{}');

      if (Object.keys(outdatedDeps).length > 0) {
        console.log(chalk.yellow('\nOutdated Dependencies:'));
        Object.entries(outdatedDeps).forEach(([pkg, info]: [string, any]) => {
          console.log(`- ${pkg}: ${info.current} → ${info.latest}`);
        });
      } else {
        console.log(chalk.green('All dependencies are up to date!'));
      }

      // Provide recommendations
      console.log(chalk.blue('\nRecommendations:'));
      
      if (sortedDeps.length > 0) {
        const [largestDep] = sortedDeps[0];
        console.log(chalk.yellow(`- Consider optimizing imports from ${largestDep} to reduce bundle size`));
      }

      if (unused.dependencies.length > 0) {
        console.log(chalk.yellow('- Remove unused dependencies to reduce package size'));
      }

      if (Object.keys(outdatedDeps).length > 0) {
        console.log(chalk.yellow('- Update outdated dependencies to get latest features and security fixes'));
      }

    } catch (error) {
      console.error(chalk.red('Error analyzing dependency impact:'), error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const analyzer = new DependencyImpactAnalyzer();
  analyzer.analyze().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  });
} 