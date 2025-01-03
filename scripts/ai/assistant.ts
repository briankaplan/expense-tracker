import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface AIResponse {
  suggestion: string;
  explanation?: string;
  code?: string;
  nextSteps?: string[];
  updates?: Array<{
    type: 'feature' | 'test' | 'doc';
    file: string;
    description: string;
  }>;
}

export class AIAssistant {
  private historyPath: string;

  constructor() {
    this.historyPath = path.join(process.cwd(), '.nexus', 'ai-history.json');
  }

  async analyze(input?: string): Promise<AIResponse> {
    const files = input ? [input] : this.getRecentlyModifiedFiles();
    const analysis = this.analyzeFiles(files);
    
    return {
      suggestion: 'Based on the analysis, here are some suggestions:',
      explanation: analysis,
      nextSteps: [
        'Review the suggested changes',
        'Run tests to verify changes',
        'Update documentation if needed'
      ]
    };
  }

  async suggest(query: string): Promise<AIResponse> {
    return {
      suggestion: `Here's a suggestion for: ${query}`,
      explanation: 'This suggestion is based on project patterns and best practices.',
      nextSteps: [
        'Consider implementing the suggestion',
        'Test the changes',
        'Update related documentation'
      ]
    };
  }

  async improve(filePath: string): Promise<AIResponse> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
      suggestion: 'Here are some improvements for the file:',
      explanation: 'These suggestions aim to improve code quality and maintainability.',
      updates: [
        {
          type: 'feature',
          file: filePath,
          description: 'Consider adding error handling'
        }
      ]
    };
  }

  async getNextSteps(): Promise<AIResponse> {
    const recentChanges = this.getRecentlyModifiedFiles();
    
    return {
      suggestion: 'Here are the recommended next steps:',
      nextSteps: [
        'Review recent changes in: ' + recentChanges.join(', '),
        'Run test suite',
        'Update documentation'
      ]
    };
  }

  async resume(): Promise<AIResponse> {
    return {
      suggestion: 'Here\'s where you left off:',
      explanation: 'Based on your recent activity',
      nextSteps: [
        'Continue working on current feature',
        'Run pending tests',
        'Review open tasks'
      ]
    };
  }

  private getRecentlyModifiedFiles(): string[] {
    try {
      const output = execSync('git diff --name-only HEAD~1 HEAD').toString();
      return output.split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private analyzeFiles(files: string[]): string {
    const analysis = files.map(file => {
      if (!fs.existsSync(file)) return `${file}: Not found`;
      
      const stats = fs.statSync(file);
      return `${file}: Last modified ${stats.mtime}`;
    });

    return analysis.join('\n');
  }
} 