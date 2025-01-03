const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

interface ScriptAnalysis {
  name: string;
  status: 'active' | 'outdated' | 'missing';
  dependencies: string[];
  usedBy: string[];
  lastModified?: string;
  issues?: string[];
}

const CORE_SCRIPTS = {
  state: [
    'session-state.ts',
    'project-state.ts',
    'sync-manager.ts',
    'recovery-manager.ts'
  ],
  verification: [
    'verify-orchestrator.ts',
    'verify-all.ts',
    'verify-reference.ts',
    'dependency-checker.ts'
  ],
  automation: [
    'auto-track.ts',
    'pre-commit.ts',
    'update-imports.ts',
    'integration-status.ts'
  ],
  analysis: [
    'analyze-impact.ts',
    'generate-tests.ts',
    'generate-verification-report.ts'
  ],
  monitoring: [
    'dashboard.ts',
    'development-checklist.ts',
    'project-roadmap.ts'
  ]
};

class ScriptAnalyzer {
  private analysis: Map<string, ScriptAnalysis> = new Map();

  async analyzeScripts() {
    console.log(chalk.blue('\n📊 Analyzing Scripts System\n'));

    // Analyze each category
    for (const [category, scripts] of Object.entries(CORE_SCRIPTS)) {
      console.log(chalk.yellow(`\n${category.toUpperCase()}\n`));
      
      for (const script of scripts) {
        const analysis = await this.analyzeScript(script);
        this.analysis.set(script, analysis);
        
        const icon = analysis.status === 'active' ? '✅' :
                    analysis.status === 'outdated' ? '⚠️' : '❌';
        
        console.log(`${icon} ${script}`);
        if (analysis.issues?.length) {
          analysis.issues.forEach(issue => {
            console.log(chalk.gray(`   - ${issue}`));
          });
        }
      }
    }

    // Generate dependency graph
    this.generateDependencyGraph();
  }

  private async analyzeScript(scriptName: string): Promise<ScriptAnalysis> {
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
    
    if (!fs.existsSync(scriptPath)) {
      return {
        name: scriptName,
        status: 'missing',
        dependencies: [],
        usedBy: [],
        issues: ['Script file does not exist']
      };
    }

    const content = fs.readFileSync(scriptPath, 'utf8');
    const stats = fs.statSync(scriptPath);
    
    const analysis: ScriptAnalysis = {
      name: scriptName,
      status: 'active',
      dependencies: this.extractDependencies(content),
      usedBy: [],
      lastModified: stats.mtime.toISOString(),
      issues: []
    };

    // Check for potential issues
    if (content.includes('TODO') || content.includes('FIXME')) {
      analysis.issues?.push('Contains TODO/FIXME comments');
      analysis.status = 'outdated';
    }

    if (!content.includes('module.exports')) {
      analysis.issues?.push('Missing exports');
      analysis.status = 'outdated';
    }

    return analysis;
  }

  private extractDependencies(content: string): string[] {
    const requireRegex = /require\(['"]\.\.?\/([^'"]+)['"]\)/g;
    const importRegex = /import .+ from ['"]\.\.?\/([^'"]+)['"]/g;
    const dependencies = new Set<string>();
    
    let match;
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    return Array.from(dependencies);
  }

  private generateDependencyGraph() {
    console.log(chalk.blue('\n📊 Dependency Graph\n'));

    this.analysis.forEach((analysis, script) => {
      if (analysis.dependencies.length > 0) {
        console.log(chalk.yellow(script));
        analysis.dependencies.forEach(dep => {
          console.log(`  └─ ${dep}`);
        });
      }
    });
  }
}

// Run analysis
const analyzer = new ScriptAnalyzer();
analyzer.analyzeScripts().catch(error => {
  console.error(chalk.red('\n❌ Analysis failed:'), error);
  process.exit(1);
}); 