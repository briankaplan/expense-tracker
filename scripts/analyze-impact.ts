import { execSync } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import { projectState } from './state/project-state';
import { sessionManager } from './session-state';
import { DependencyChecker } from './dependency-checker';

export interface ImpactAnalysis {
  files: string[];
  components: string[];
  features: string[];
  tests: string[];
  dependencies: string[];
  risk: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export class ImpactAnalyzer {
  async analyzeChanges(): Promise<ImpactAnalysis> {
    console.log(chalk.blue('\n🔍 Analyzing Impact of Changes\n'));

    const recentChanges = await this.getRecentChanges();
    const analysis = await this.analyzeFiles(recentChanges);

    this.updateProjectState(analysis);
    this.generateReport(analysis);

    return analysis;
  }

  private async getRecentChanges(): Promise<string[]> {
    try {
      return execSync('git diff --name-only HEAD~1')
        .toString()
        .split('\n')
        .filter(Boolean);
    } catch (error) {
      console.error(chalk.red('Failed to get recent changes:'), error);
      return [];
    }
  }

  private async analyzeFiles(files: string[]): Promise<ImpactAnalysis> {
    const analysis: ImpactAnalysis = {
      files,
      components: [],
      features: [],
      tests: [],
      dependencies: [],
      risk: 'low',
      suggestions: []
    };

    // Analyze components
    analysis.components = files.filter(f => f.includes('components/'));
    
    // Analyze features
    analysis.features = files.filter(f => f.includes('features/'));
    
    // Analyze tests
    analysis.tests = files.filter(f => f.includes('.test.'));
    
    // Check dependencies
    const checker = new DependencyChecker();
    analysis.dependencies = await checker.checkDependencies();
    
    // Calculate risk level
    analysis.risk = this.calculateRiskLevel(analysis);
    
    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  private calculateRiskLevel(analysis: ImpactAnalysis): 'low' | 'medium' | 'high' {
    if (analysis.components.length > 5 || analysis.features.length > 2) {
      return 'high';
    }
    if (analysis.components.length > 2 || analysis.features.length > 0) {
      return 'medium';
    }
    return 'low';
  }

  private generateSuggestions(analysis: ImpactAnalysis): string[] {
    const suggestions: string[] = [];

    // Add test suggestions
    if (analysis.tests.length === 0) {
      suggestions.push(`Add tests for: ${analysis.files.join(', ')}`);
    }

    // Component suggestions
    if (analysis.components.length > 0) {
      suggestions.push('Review component dependencies and interfaces');
    }

    // Risk level suggestions
    if (analysis.risk === 'high') {
      suggestions.push('Recommend thorough code review');
      suggestions.push('Consider staging deployment');
    }

    return suggestions;
  }

  private updateProjectState(analysis: ImpactAnalysis): void {
    projectState.setState({
      lastAnalysis: {
        timestamp: new Date().toISOString(),
        risk: analysis.risk,
        components: analysis.components,
        features: analysis.features
      }
    });

    sessionManager.updateContext({
      lastAnalysis: analysis
    });
  }

  private generateReport(analysis: ImpactAnalysis): void {
    console.log(chalk.yellow('\nImpact Analysis Report\n'));

    // Risk Level
    const riskColor = analysis.risk === 'low' ? 'green' : 
                     analysis.risk === 'medium' ? 'yellow' : 'red';
    console.log(`Risk Level: ${chalk[riskColor](analysis.risk.toUpperCase())}\n`);

    // Components
    console.log(chalk.cyan('Affected Components:'));
    analysis.components.forEach(c => console.log(`• ${c}`));

    // Features
    if (analysis.features.length > 0) {
      console.log(chalk.cyan('\nAffected Features:'));
      analysis.features.forEach(f => console.log(`• ${f}`));
    }

    // Tests
    console.log(chalk.cyan('\nTest Coverage:'));
    console.log(`${analysis.tests.length} test files affected`);

    // Suggestions
    if (analysis.suggestions.length > 0) {
      console.log(chalk.cyan('\nSuggestions:'));
      analysis.suggestions.forEach(s => console.log(`• ${s}`));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new ImpactAnalyzer();
  analyzer.analyzeChanges().catch(error => {
    console.error(chalk.red('Error analyzing changes:'), error);
    process.exit(1);
  });
} 