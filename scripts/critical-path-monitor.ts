import { execSync } from 'child_process';
import chalk from 'chalk';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

class CriticalPathMonitor {
  async monitor() {
    console.log(chalk.blue('\n🔍 Analyzing Critical Paths...\n'));

    try {
      // Check build time
      console.log(chalk.yellow('Analyzing build performance...'));
      const buildStart = Date.now();
      execSync('npm run build', { stdio: 'inherit' });
      const buildTime = Date.now() - buildStart;
      console.log(chalk.green(`Build completed in ${(buildTime / 1000).toFixed(2)}s`));

      // Analyze bundle size
      console.log(chalk.yellow('\nAnalyzing bundle sizes...'));
      const buildDir = path.join(process.cwd(), '.next');
      const jsFiles = glob.sync(path.join(buildDir, 'static/chunks/**/*.js'));
      
      let totalSize = 0;
      const largeFiles: { name: string; size: number }[] = [];

      jsFiles.forEach(file => {
        const stats = fs.statSync(file);
        const sizeKB = stats.size / 1024;
        totalSize += sizeKB;

        if (sizeKB > 100) { // Flag files larger than 100KB
          largeFiles.push({
            name: path.basename(file),
            size: sizeKB
          });
        }
      });

      console.log(chalk.green(`Total bundle size: ${(totalSize / 1024).toFixed(2)}MB`));
      
      if (largeFiles.length > 0) {
        console.log(chalk.yellow('\nLarge bundles detected:'));
        largeFiles
          .sort((a, b) => b.size - a.size)
          .forEach(file => {
            console.log(`- ${file.name}: ${file.size.toFixed(2)}KB`);
          });
      }

      // Check for circular dependencies
      console.log(chalk.yellow('\nChecking for circular dependencies...'));
      const madge = require('madge');
      const result = await madge('src/', {
        fileExtensions: ['ts', 'tsx'],
        excludeRegExp: [/\.test\./, /\.spec\./]
      });
      
      const circular = result.circular();
      if (circular.length > 0) {
        console.log(chalk.red('\nCircular Dependencies Detected:'));
        circular.forEach((path: string[]) => {
          console.log(`- ${path.join(' → ')}`);
        });
      } else {
        console.log(chalk.green('No circular dependencies found!'));
      }

      // Check for unused exports
      console.log(chalk.yellow('\nChecking for unused exports...'));
      try {
        execSync('npx ts-prune', { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.red('Some unused exports were found. Consider cleaning them up.'));
      }

      // Performance recommendations
      console.log(chalk.blue('\nPerformance Recommendations:'));
      if (buildTime > 60000) {
        console.log(chalk.yellow('- Build time is high. Consider optimizing build configuration.'));
      }
      if (totalSize > 5 * 1024) { // If total size is more than 5MB
        console.log(chalk.yellow('- Bundle size is large. Consider code splitting and lazy loading.'));
      }
      if (circular.length > 0) {
        console.log(chalk.yellow('- Resolve circular dependencies to improve maintainability.'));
      }

    } catch (error) {
      console.error(chalk.red('Error monitoring critical paths:'), error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const monitor = new CriticalPathMonitor();
  monitor.monitor().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  });
} 