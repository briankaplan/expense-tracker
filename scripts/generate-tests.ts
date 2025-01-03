const { DependencyImpactAnalyzer } = require('./dependency-impact');
const { ANALYSIS_CONFIG, VERIFICATION_RULES } = require('./config/analysis-config');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

interface TestTemplate {
  type: 'unit' | 'integration';
  component: string;
  dependencies: string[];
  criticalPaths: string[];
}

class TestGenerator {
  private analyzer: DependencyImpactAnalyzer;

  constructor() {
    this.analyzer = new DependencyImpactAnalyzer(path.join(process.cwd(), 'src'));
    this.analyzer.buildDependencyGraph();
  }

  generateTestFile(template: TestTemplate): string {
    const { component, dependencies, type } = template;
    const componentName = path.basename(component, path.extname(component));
    
    return `
import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from '${component}';
${dependencies.map(dep => `import { ${path.basename(dep, path.extname(dep))} } from '${dep}';`).join('\n')}

describe('${componentName}', () => {
  ${type === 'unit' ? this.generateUnitTests(template) : this.generateIntegrationTests(template)}
});`;
  }

  private generateUnitTests(template: TestTemplate): string {
    // Generate unit test cases based on component analysis
    return `
  it('renders without crashing', () => {
    render(<${path.basename(template.component, path.extname(template.component))} />);
    expect(screen).toBeDefined();
  });

  // Generated test cases based on dependencies
  ${template.dependencies.map(dep => `
  it('handles ${path.basename(dep, path.extname(dep))} interaction', () => {
    // TODO: Implement test
  });`).join('\n')}
`;
  }

  private generateIntegrationTests(template: TestTemplate): string {
    // Generate integration test cases based on critical paths
    return `
  it('integrates with dependent components', () => {
    // TODO: Implement integration test
  });

  ${template.criticalPaths.map(path => `
  it('handles ${path} workflow', () => {
    // TODO: Implement workflow test
  });`).join('\n')}
`;
  }

  async generateTests() {
    console.log(chalk.blue('\n🧪 Generating Tests...\n'));

    const criticalFiles = VERIFICATION_RULES.dependencies.criticalFiles;
    
    for (const file of criticalFiles) {
      const analysis = this.analyzer.analyzeFileImpact(file);
      
      // Generate unit tests
      const unitTemplate: TestTemplate = {
        type: 'unit',
        component: file,
        dependencies: analysis.directImpact,
        criticalPaths: []
      };

      // Generate integration tests if high impact
      if (analysis.riskLevel === 'high') {
        const integrationTemplate: TestTemplate = {
          type: 'integration',
          component: file,
          dependencies: analysis.directImpact,
          criticalPaths: analysis.criticalPaths.map(p => p.join(' → '))
        };

        await this.writeTestFile(file, 'integration', integrationTemplate);
      }

      await this.writeTestFile(file, 'unit', unitTemplate);
    }
  }

  private async writeTestFile(file: string, type: 'unit' | 'integration', template: TestTemplate) {
    const dir = path.join(process.cwd(), '__tests__', type);
    const testPath = path.join(dir, `${path.basename(file, path.extname(file))}.test.tsx`);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(testPath, this.generateTestFile(template));
    
    console.log(chalk.green(`✅ Generated ${type} tests for ${file}`));
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new TestGenerator();
  generator.generateTests().catch(error => {
    console.error(chalk.red('\n❌ Test generation failed:'), error);
    process.exit(1);
  });
}

module.exports = {
  TestGenerator,
  TestTemplate
}; 