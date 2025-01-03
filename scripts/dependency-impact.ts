import { DependencyChecker } from './dependency-checker';
import chalk from 'chalk';
import path from 'path';

export interface ImpactAnalysis {
  directImpact: string[];      // Files directly importing the target
  indirectImpact: string[];    // Files that depend on impacted files
  criticalPaths: string[][];   // Paths to critical dependencies
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export class DependencyImpactAnalyzer extends DependencyChecker {
  analyzeFileImpact(targetFile: string): ImpactAnalysis {
    const analysis: ImpactAnalysis = {
      directImpact: [],
      indirectImpact: [],
      criticalPaths: [],
      riskLevel: 'low',
      suggestions: []
    };

    // Get direct dependents
    analysis.directImpact = this.getDependents(targetFile);

    // Calculate indirect impact
    const seen = new Set<string>([targetFile, ...analysis.directImpact]);
    const queue = [...analysis.directImpact];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.getDependents(current);

      dependents.forEach(dep => {
        if (!seen.has(dep)) {
          seen.add(dep);
          queue.push(dep);
          analysis.indirectImpact.push(dep);
        }
      });
    }

    // Find critical paths
    analysis.criticalPaths = this.findCriticalPaths(targetFile);

    // Determine risk level
    analysis.riskLevel = this.calculateRiskLevel(analysis);

    // Generate suggestions
    this.generateImpactSuggestions(analysis);

    return analysis;
  }

  private findCriticalPaths(file: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, path: string[]) => {
      if (visited.has(current)) return;
      visited.add(current);

      const dependents = this.getDependents(current);
      if (dependents.length === 0) {
        paths.push([...path, current]);
      }

      dependents.forEach(dep => {
        dfs(dep, [...path, current]);
      });
    };

    dfs(file, []);
    return paths;
  }

  private calculateRiskLevel(analysis: ImpactAnalysis): 'low' | 'medium' | 'high' {
    const totalImpact = analysis.directImpact.length + analysis.indirectImpact.length;
    const criticalPathLength = Math.max(...analysis.criticalPaths.map(p => p.length));

    if (totalImpact > 10 || criticalPathLength > 5) return 'high';
    if (totalImpact > 5 || criticalPathLength > 3) return 'medium';
    return 'low';
  }

  private generateImpactSuggestions(analysis: ImpactAnalysis): void {
    if (analysis.riskLevel === 'high') {
      analysis.suggestions.push(
        '⚠️ Consider breaking down dependencies into smaller modules',
        '⚠️ Add comprehensive tests before making changes',
        '⚠️ Plan for incremental rollout'
      );
    }

    if (analysis.criticalPaths.length > 3) {
      analysis.suggestions.push(
        '📝 Consider implementing dependency injection',
        '📝 Add interface abstractions to reduce coupling'
      );
    }

    if (analysis.indirectImpact.length > analysis.directImpact.length * 2) {
      analysis.suggestions.push(
        '🔄 High indirect impact detected - consider restructuring dependencies',
        '🔄 Add integration tests for indirect dependencies'
      );
    }
  }

  generateImpactReport(targetFile: string): string {
    const analysis = this.analyzeFileImpact(targetFile);
    const relativePath = path.relative(this.srcRoot, targetFile);
    
    let report = chalk.blue(`\n📊 Impact Analysis for ${relativePath}\n\n`);

    // Risk Level
    report += chalk.yellow(`Risk Level: ${analysis.riskLevel.toUpperCase()}\n\n`);

    // Direct Impact
    report += chalk.yellow('Direct Dependencies:\n');
    analysis.directImpact.forEach(file => {
      report += `  ${path.relative(this.srcRoot, file)}\n`;
    });
    report += '\n';

    // Indirect Impact
    if (analysis.indirectImpact.length > 0) {
      report += chalk.yellow('Indirect Dependencies:\n');
      analysis.indirectImpact.forEach(file => {
        report += `  ${path.relative(this.srcRoot, file)}\n`;
      });
      report += '\n';
    }

    // Critical Paths
    if (analysis.criticalPaths.length > 0) {
      report += chalk.yellow('Critical Dependency Paths:\n');
      analysis.criticalPaths.forEach((path, i) => {
        report += `  Path ${i + 1}: ${path.map(f => 
          path.relative(this.srcRoot, f)
        ).join(' → ')}\n`;
      });
      report += '\n';
    }

    // Suggestions
    if (analysis.suggestions.length > 0) {
      report += chalk.yellow('Suggestions:\n');
      analysis.suggestions.forEach(suggestion => {
        report += `  ${suggestion}\n`;
      });
    }

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new DependencyImpactAnalyzer();
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error(chalk.red('Please provide a target file to analyze'));
    process.exit(1);
  }
  console.log(analyzer.generateImpactReport(targetFile));
} 