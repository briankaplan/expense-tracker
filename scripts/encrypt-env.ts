import { Encryption } from '../src/lib/utils/encryption';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';

// List of environment variables that should be encrypted
const SENSITIVE_VARS = [
  'NEXT_PUBLIC_R2_SECRET_ACCESS_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_MINDEE_API_KEY',
  'OPENAI_API_KEY',
];

async function encryptEnvFile(sourceFile: string, targetFile: string) {
  console.log(chalk.blue('🔒 Encrypting sensitive environment variables...'));
  
  try {
    // Read the source .env file
    const envContent = fs.readFileSync(sourceFile, 'utf8');
    const env = dotenv.parse(envContent);
    
    // Generate a new encryption key if not provided
    const encryptionKey = process.env.ENCRYPTION_KEY || Encryption.generateKey();
    const encryption = new Encryption(encryptionKey);
    
    // Track changes
    let encryptedCount = 0;
    let skippedCount = 0;
    
    // Process each environment variable
    const processedEnv = Object.entries(env).map(([key, value]) => {
      if (SENSITIVE_VARS.includes(key) && value && !value.startsWith('enc:')) {
        try {
          const encrypted = encryption.encrypt(value);
          encryptedCount++;
          return `${key}=${encrypted}`;
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  Failed to encrypt ${key}`));
          skippedCount++;
          return `${key}=${value}`;
        }
      }
      return `${key}=${value}`;
    });
    
    // Add the encryption key if it's new
    if (!env.ENCRYPTION_KEY) {
      processedEnv.push(`ENCRYPTION_KEY=${encryptionKey}`);
    }
    
    // Write the encrypted environment to the target file
    fs.writeFileSync(targetFile, processedEnv.join('\n'));
    
    // Output results
    console.log(chalk.green(`✓ Encrypted ${encryptedCount} variables`));
    if (skippedCount > 0) {
      console.warn(chalk.yellow(`⚠️  Skipped ${skippedCount} variables`));
    }
    
    // Backup the original file
    const backupFile = `${sourceFile}.backup`;
    fs.copyFileSync(sourceFile, backupFile);
    console.log(chalk.blue(`ℹ️  Original .env backed up to ${backupFile}`));
    
    // Security reminder
    console.log(chalk.yellow('\n⚠️  IMPORTANT:'));
    console.log(chalk.yellow('- Keep your ENCRYPTION_KEY secure'));
    console.log(chalk.yellow('- Store it separately in production'));
    console.log(chalk.yellow('- Never commit the original .env file'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error encrypting environment variables:'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

// Get the source and target files from command line arguments
const sourceFile = process.argv[2] || '.env';
const targetFile = process.argv[3] || '.env.encrypted';

// Run the encryption
encryptEnvFile(sourceFile, targetFile); 