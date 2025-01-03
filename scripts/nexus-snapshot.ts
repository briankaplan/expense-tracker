const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

interface NexusSnapshot {
  timestamp: string;
  projectState: any;
  packageJson: any;
  tsConfig: any;
}

class SnapshotManager {
  private snapshotPath = path.join(process.cwd(), '.nexus-snapshot.json');

  saveSnapshot(): void {
    try {
      // Read current project state
      const { projectState } = require('./state/project-state');
      
      // Read package.json
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
      );

      // Read tsconfig.json
      const tsConfig = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'scripts/tsconfig.json'), 'utf8')
      );

      const snapshot: NexusSnapshot = {
        timestamp: new Date().toISOString(),
        projectState: projectState.getState(),
        packageJson,
        tsConfig
      };

      fs.writeFileSync(this.snapshotPath, JSON.stringify(snapshot, null, 2));
      console.log(chalk.green('\n✓ Nexus configuration snapshot saved successfully'));
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to save Nexus snapshot:'), error);
      process.exit(1);
    }
  }

  loadSnapshot(): void {
    try {
      if (!fs.existsSync(this.snapshotPath)) {
        console.error(chalk.red('\n✗ No snapshot file found'));
        process.exit(1);
      }

      const snapshot: NexusSnapshot = JSON.parse(
        fs.readFileSync(this.snapshotPath, 'utf8')
      );

      // Restore project state
      const { projectState } = require('./state/project-state');
      Object.assign(projectState, {
        currentPhase: snapshot.projectState.currentPhase,
        projectDefinition: snapshot.projectState.projectDefinition,
        integrations: snapshot.projectState.integrations
      });

      // Restore package.json scripts
      const currentPackageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
      );
      currentPackageJson.scripts = snapshot.packageJson.scripts;
      fs.writeFileSync(
        path.join(process.cwd(), 'package.json'),
        JSON.stringify(currentPackageJson, null, 2)
      );

      // Restore tsconfig.json
      fs.writeFileSync(
        path.join(process.cwd(), 'scripts/tsconfig.json'),
        JSON.stringify(snapshot.tsConfig, null, 2)
      );

      console.log(chalk.green('\n✓ Nexus configuration restored successfully'));
      console.log(chalk.blue(`\nSnapshot from: ${snapshot.timestamp}`));
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to load Nexus snapshot:'), error);
      process.exit(1);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const manager = new SnapshotManager();

if (args[0] === 'save') {
  manager.saveSnapshot();
} else if (args[0] === 'load') {
  manager.loadSnapshot();
} else {
  console.error(chalk.red('\n✗ Invalid command. Use "save" or "load"'));
  process.exit(1);
}

module.exports = {
  SnapshotManager
}; 