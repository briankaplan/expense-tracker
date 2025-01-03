import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const commands = [
  // Create new directory structure
  'mkdir -p src/components/ui',
  'mkdir -p src/components/views/layout',
  'mkdir -p src/components/views/auth',
  'mkdir -p src/components/views/expenses',
  'mkdir -p src/components/views/subscriptions',
  'mkdir -p src/lib/firebase',
  'mkdir -p src/lib/hooks',
  'mkdir -p src/lib/services',
  
  // Move UI components
  'mv components/ui/* src/components/ui/',
  
  // Move view components
  'mv components/views/layout/* src/components/views/layout/',
  'mv components/views/auth/* src/components/views/auth/',
  'mv components/views/expenses/* src/components/views/expenses/',
  
  // Move lib files
  'mv lib/firebase/* src/lib/firebase/',
  'mv lib/hooks/* src/lib/hooks/',
  'mv lib/services/* src/lib/services/',
  
  // Clean up old directories
  'rm -rf components',
  'rm -rf lib'
];

commands.forEach(cmd => {
  try {
    execSync(cmd);
  } catch (error) {
    console.error(`Error executing: ${cmd}`);
  }
}); 