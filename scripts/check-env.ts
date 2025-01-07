import { env } from '../src/lib/config/env';
import chalk from 'chalk';
import crypto from 'crypto';

interface SecurityCheck {
  name: string;
  check: () => boolean;
  severity: 'error' | 'warning';
  message: string;
}

const securityChecks: SecurityCheck[] = [
  {
    name: 'Production Environment',
    check: () => process.env.NODE_ENV === 'production' 
      ? !env.teller.environment.includes('sandbox')
      : true,
    severity: 'error',
    message: 'Cannot use sandbox environment in production',
  },
  {
    name: 'R2 Secret Length',
    check: () => env.r2.secretAccessKey.length >= 40,
    severity: 'warning',
    message: 'R2 secret access key seems too short',
  },
  {
    name: 'OpenAI Key Format',
    check: () => env.openai.apiKey.startsWith('sk-'),
    severity: 'error',
    message: 'Invalid OpenAI API key format',
  },
  {
    name: 'Supabase URL Security',
    check: () => !env.supabase.url.includes('localhost'),
    severity: 'warning',
    message: 'Using localhost for Supabase URL',
  },
  {
    name: 'API Key Strength',
    check: () => {
      const keys = [
        env.r2.secretAccessKey,
        env.mindee.apiKey,
        env.openai.apiKey,
      ];
      return keys.every(key => {
        const entropy = calculateEntropy(key);
        return entropy >= 128; // Minimum 128 bits of entropy
      });
    },
    severity: 'warning',
    message: 'Some API keys have low entropy',
  },
  {
    name: 'Production URLs',
    check: () => process.env.NODE_ENV === 'production' 
      ? !Object.values(env).some(v => 
          typeof v === 'string' && v.includes('localhost')
        )
      : true,
    severity: 'error',
    message: 'Found localhost URLs in production environment',
  },
  {
    name: 'Encryption Check',
    check: () => process.env.ENCRYPTION_KEY !== undefined,
    severity: 'warning',
    message: 'Encryption key not set for sensitive values',
  },
];

function calculateEntropy(str: string): number {
  const len = str.length;
  const frequencies = new Map<string, number>();
  
  // Calculate character frequencies
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  
  // Calculate entropy
  return Array.from(frequencies.values()).reduce((entropy, freq) => {
    const p = freq / len;
    return entropy - p * Math.log2(p);
  }, 0) * len;
}

function checkEnvironmentSecurity() {
  console.log(chalk.blue('🔒 Performing security checks...'));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Run all security checks
  for (const check of securityChecks) {
    try {
      const passed = check.check();
      if (!passed) {
        if (check.severity === 'error') {
          console.error(chalk.red(`❌ ${check.name}: ${check.message}`));
          hasErrors = true;
        } else {
          console.warn(chalk.yellow(`⚠️  ${check.name}: ${check.message}`));
          hasWarnings = true;
        }
      } else {
        console.log(chalk.green(`✓ ${check.name}`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error in ${check.name}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      hasErrors = true;
    }
  }
  
  // Additional production checks
  if (process.env.NODE_ENV === 'production') {
    console.log(chalk.blue('\n🔒 Additional production checks...'));
    
    // Check for minimum key lengths
    const keyLengths = {
      'R2 Secret Key': env.r2.secretAccessKey.length >= 40,
      'Supabase Anon Key': env.supabase.anonKey.length >= 90,
      'OpenAI API Key': env.openai.apiKey.length >= 50,
    };
    
    for (const [key, isValid] of Object.entries(keyLengths)) {
      if (!isValid) {
        console.warn(chalk.yellow(`⚠️  ${key} length is shorter than recommended`));
        hasWarnings = true;
      }
    }
    
    // Check for secure URLs
    const urls = [
      env.r2.publicUrl,
      env.supabase.url,
      env.teller.apiUrl,
    ];
    
    for (const url of urls) {
      if (!url.startsWith('https://')) {
        console.error(chalk.red('❌ Non-HTTPS URL detected in production'));
        hasErrors = true;
      }
    }
  }
  
  // Final status
  console.log('\n' + chalk.blue('📊 Security Check Summary'));
  if (hasErrors) {
    console.error(chalk.red('❌ Security checks failed with errors'));
    process.exit(1);
  } else if (hasWarnings) {
    console.warn(chalk.yellow('⚠️  Security checks passed with warnings'));
  } else {
    console.log(chalk.green('✓ All security checks passed'));
  }
}

// Run all checks
function checkEnvVariables() {
  console.log(chalk.blue('Checking environment variables...'));
  
  try {
    // Validate environment variables
    const config = env;
    console.log(chalk.green('✓ All required environment variables are present'));
    
    // Perform security checks
    checkEnvironmentSecurity();
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red('❌ Error checking environment variables:'));
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

checkEnvVariables(); 