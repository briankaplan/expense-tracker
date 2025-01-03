import { execSync } from 'child_process';
import chalk from 'chalk';

class DependencyChecker {
  async checkDependencies() {
    console.log(chalk.blue('\n📦 Checking Dependencies...\n'));

    try {
      // Check for outdated dependencies
      console.log(chalk.yellow('Checking for outdated packages...'));
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdatedPackages = JSON.parse(outdated || '{}');
      
      if (Object.keys(outdatedPackages).length > 0) {
        console.log(chalk.yellow('\nOutdated Packages:'));
        Object.entries(outdatedPackages).forEach(([pkg, info]: [string, any]) => {
          console.log(`${pkg}: ${info.current} → ${info.latest}`);
        });
      } else {
        console.log(chalk.green('All packages are up to date!'));
      }

      // Check for security vulnerabilities
      console.log(chalk.yellow('\nChecking for vulnerabilities...'));
      try {
        execSync('npm audit', { stdio: 'inherit' });
        console.log(chalk.green('No vulnerabilities found!'));
      } catch (error) {
        console.log(chalk.red('Vulnerabilities detected. Please run npm audit fix'));
      }

      // Check for duplicate dependencies
      console.log(chalk.yellow('\nChecking for duplicate dependencies...'));
      const list = execSync('npm list --json', { encoding: 'utf8' });
      const dependencies = JSON.parse(list);
      const duplicates = this.findDuplicates(dependencies);
      
      if (duplicates.length > 0) {
        console.log(chalk.yellow('\nDuplicate Dependencies:'));
        duplicates.forEach(dup => console.log(`- ${dup}`));
      } else {
        console.log(chalk.green('No duplicate dependencies found!'));
      }

    } catch (error) {
      console.error(chalk.red('Error checking dependencies:'), error);
      process.exit(1);
    }
  }

  private findDuplicates(dependencies: any, path: string = '', result: string[] = []): string[] {
    if (!dependencies.dependencies) return result;

    const deps = dependencies.dependencies;
    const seen = new Map<string, string>();

    Object.entries(deps).forEach(([name, info]: [string, any]) => {
      const version = (info as any).version;
      const fullPath = path ? `${path} > ${name}` : name;

      if (seen.has(name)) {
        const existingVersion = seen.get(name);
        if (existingVersion !== version) {
          result.push(`${name} (${existingVersion} and ${version})`);
        }
      } else {
        seen.set(name, version);
      }

      this.findDuplicates(info, fullPath, result);
    });

    return result;
  }
}

if (require.main === module) {
  const checker = new DependencyChecker();
  checker.checkDependencies().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  });
} 