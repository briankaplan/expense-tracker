const fs = require('fs');
const path = require('path');

class ProjectState {
  currentPhase: string = 'development';
  projectDefinition: {
    pages: {
      [key: string]: {
        features: Array<{
          name: string;
          status: 'pending' | 'in-progress' | 'completed';
          priority: 'high' | 'medium' | 'low';
        }>;
      };
    };
  } = {
    pages: {
      expenses: {
        features: [
          {
            name: 'Expense Tracking',
            status: 'in-progress',
            priority: 'high'
          }
        ]
      }
    }
  };
  integrations: {
    [key: string]: {
      status: 'active' | 'inactive' | 'error';
      lastChecked: string;
    };
  } = {
    dependencies: {
      status: 'active',
      lastChecked: new Date(0).toISOString() // Force a check
    },
    criticalPaths: {
      status: 'active',
      lastChecked: new Date(0).toISOString() // Force a check
    },
    gitHooks: {
      status: 'active',
      lastChecked: new Date(0).toISOString() // Force a check
    }
  };

  getState() {
    return {
      currentPhase: this.currentPhase,
      projectDefinition: this.projectDefinition,
      integrations: this.integrations
    };
  }
}

const projectState = new ProjectState();

module.exports = {
  projectState
}; 