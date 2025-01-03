import { projectState } from './state/project-state';
import chalk from 'chalk';
import { execSync } from 'child_process';

export interface IntegrationConfig {
  name: string;
  type: 'api' | 'plugin' | 'service';
  checkEndpoint?: string;
  envVars: string[];
  testFile?: string;
  dependencies?: string[];
}

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: 'Firebase Auth',
    type: 'service',
    envVars: ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN'],
    testFile: 'src/lib/firebase/auth.test.ts'
  },
  {
    name: 'Firebase Database',
    type: 'service',
    envVars: ['FIREBASE_DATABASE_URL'],
    dependencies: ['Firebase Auth']
  },
  {
    name: 'Teller API',
    type: 'api',
    checkEndpoint: 'https://api.teller.io/health',
    envVars: ['TELLER_API_KEY', 'TELLER_ENV'],
    testFile: 'src/lib/teller-api/client.test.ts'
  },
  {
    name: 'Mindee OCR',
    type: 'api',
    envVars: ['MINDEE_API_KEY'],
    testFile: 'src/lib/mindee/client.test.ts'
  },
  {
    name: 'ChatGPT API',
    type: 'api',
    envVars: ['OPENAI_API_KEY'],
    testFile: 'src/lib/chatgpt/client.test.ts'
  },
  {
    name: 'Gmail Plugin',
    type: 'plugin',
    envVars: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET'],
    testFile: 'src/lib/gmail-plugin/client.test.ts'
  },
  {
    name: 'Dropbox API',
    type: 'api',
    envVars: ['DROPBOX_APP_KEY', 'DROPBOX_APP_SECRET'],
    testFile: 'src/lib/dropbox/client.test.ts'
  }
];

export interface IntegrationStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastChecked: string;
  error?: string;
  missingEnvVars?: string[];
}

export class IntegrationChecker {
  async checkAll(): Promise<IntegrationStatus[]> {
    console.log(chalk.blue('\n🔌 Checking Integration Status\n'));
    
    const statuses: IntegrationStatus[] = [];

    for (const integration of INTEGRATIONS) {
      const status = await this.checkIntegration(integration);
      statuses.push(status);
      
      // Update project state
      projectState.updateIntegrationStatus(integration.name, status);
      
      // Log status
      this.logStatus(status);
    }

    return statuses;
  }

  private async checkIntegration(config: IntegrationConfig): Promise<IntegrationStatus> {
    try {
      // Check environment variables
      const missingEnvVars = config.envVars.filter(env => !process.env[env]);
      if (missingEnvVars.length > 0) {
        return {
          name: config.name,
          status: 'inactive',
          lastChecked: new Date().toISOString(),
          missingEnvVars
        };
      }

      // Check dependencies
      if (config.dependencies) {
        const dependencyStatuses = await Promise.all(
          config.dependencies.map(dep => {
            const depConfig = INTEGRATIONS.find(i => i.name === dep);
            return depConfig ? this.checkIntegration(depConfig) : null;
          })
        );

        if (dependencyStatuses.some(s => s?.status !== 'active')) {
          return {
            name: config.name,
            status: 'inactive',
            lastChecked: new Date().toISOString(),
            error: 'Dependency check failed'
          };
        }
      }

      // Run integration tests if available
      if (config.testFile && fs.existsSync(config.testFile)) {
        try {
          execSync(`npm test ${config.testFile}`, { stdio: 'pipe' });
        } catch (error) {
          return {
            name: config.name,
            status: 'error',
            lastChecked: new Date().toISOString(),
            error: 'Integration tests failed'
          };
        }
      }

      // Check endpoint if available
      if (config.checkEndpoint) {
        try {
          const response = await fetch(config.checkEndpoint);
          if (!response.ok) throw new Error('Endpoint check failed');
        } catch (error) {
          return {
            name: config.name,
            status: 'error',
            lastChecked: new Date().toISOString(),
            error: error.message
          };
        }
      }

      return {
        name: config.name,
        status: 'active',
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: config.name,
        status: 'error',
        lastChecked: new Date().toISOString(),
        error: error.message
      };
    }
  }

  private logStatus(status: IntegrationStatus) {
    const icon = status.status === 'active' ? '✅' :
                 status.status === 'inactive' ? '⚠️' : '❌';
    
    console.log(`${icon} ${status.name}: ${status.status}`);
    if (status.error) {
      console.log(chalk.red(`   Error: ${status.error}`));
    }
    if (status.missingEnvVars?.length) {
      console.log(chalk.yellow(`   Missing env vars: ${status.missingEnvVars.join(', ')}`));
    }
  }
}

export async function checkIntegrationStatus(): Promise<IntegrationStatus[]> {
  const checker = new IntegrationChecker();
  return checker.checkAll();
}

// Add to package.json:
// "check:integrations": "ts-node --transpile-only scripts/integration-status.ts"

const checker = new IntegrationChecker();
checker.checkAll().catch(error => {
  console.error(chalk.red('\n❌ Integration check failed:'), error);
  process.exit(1);
}); 