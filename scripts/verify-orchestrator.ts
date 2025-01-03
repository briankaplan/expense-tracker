import { chalk } from './utils/fs-helpers';
import { verifyAll } from './verify-all';

interface ProjectState {
  progress: number;
  currentPhase: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  errors: string[];
  warnings: string[];
}

const projectState: ProjectState = {
  progress: 0,
  currentPhase: 'initialization',
  status: 'pending',
  errors: [],
  warnings: []
};

function updateProgress(phase: string, progress: number) {
  projectState.currentPhase = phase;
  projectState.progress = progress;
  displayStatus();
}

function displayStatus() {
  console.clear();
  console.log(chalk.blue('\n🔍 Project Verification Status\n'));
  console.log(`Current Phase: ${projectState.currentPhase}`);
  console.log(`Progress: ${projectState.progress.toFixed(1)}%`);
  
  if (projectState.errors.length > 0) {
    console.log(chalk.red('\nErrors:'));
    projectState.errors.forEach(error => console.log(`  ❌ ${error}`));
  }
  
  if (projectState.warnings.length > 0) {
    console.log(chalk.yellow('\nWarnings:'));
    projectState.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
  }
}

async function runOrchestrator() {
  try {
    updateProgress('Starting Verification', 0);
    await verifyAll();
    projectState.status = 'completed';
    updateProgress('Verification Complete', 100);
  } catch (error) {
    projectState.status = 'failed';
    projectState.errors.push(error.message);
    updateProgress('Verification Failed', projectState.progress);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runOrchestrator().catch(error => {
    console.error(chalk.red('\n❌ Orchestration failed:'), error);
    process.exit(1);
  });
} 