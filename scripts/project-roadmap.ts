const chalk = require('chalk');

interface Feature {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface Milestone {
  name: string;
  description: string;
  targetDate: string;
  features: string[];
  status: 'pending' | 'in-progress' | 'completed';
  dependencies?: string[];
}

interface PageDefinition {
  name: string;
  route: string;
  features: Feature[];
  status: 'pending' | 'in-progress' | 'completed';
}

interface ProjectDefinition {
  name: string;
  version: string;
  phases: {
    name: string;
    milestones: Milestone[];
  }[];
  integrations: {
    authentication: string;
    database: string;
    hosting: string;
    ocr: string;
    banking: string;
    ai: string;
    storage: string;
  };
  pages: {
    [key: string]: PageDefinition;
  };
}

const PROJECT_DEFINITION: ProjectDefinition = {
  name: 'Expense Tracker',
  version: '0.1.0',
  phases: [
    {
      name: 'Foundation',
      milestones: [
        {
          name: 'Core Setup',
          description: 'Basic project structure and essential features',
          targetDate: '2024-01-15',
          status: 'completed',
          features: [
            'Manual Entry',
            'Basic UI Components',
            'Project Structure'
          ]
        },
        {
          name: 'Authentication',
          description: 'User authentication and basic profile management',
          targetDate: '2024-01-30',
          status: 'in-progress',
          features: [
            'Firebase Integration',
            'User Profiles',
            'Auth Flow'
          ]
        }
      ]
    },
    {
      name: 'Core Features',
      milestones: [
        {
          name: 'Expense Management',
          description: 'Complete expense tracking functionality',
          targetDate: '2024-02-15',
          status: 'in-progress',
          features: [
            'Live Bank Feed',
            'Receipt Matching',
            'Auto Categorization'
          ],
          dependencies: ['Authentication']
        },
        {
          name: 'Receipt Processing',
          description: 'OCR and receipt management',
          targetDate: '2024-03-01',
          status: 'pending',
          features: [
            'Batch Upload',
            'OCR Processing',
            'Receipt Validation'
          ],
          dependencies: ['Expense Management']
        }
      ]
    },
    {
      name: 'Advanced Features',
      milestones: [
        {
          name: 'Reporting System',
          description: 'Advanced reporting and analytics',
          targetDate: '2024-03-15',
          status: 'pending',
          features: [
            'Report Creation',
            'Export Functionality',
            'Report Summary'
          ],
          dependencies: ['Receipt Processing']
        },
        {
          name: 'Integrations',
          description: 'Third-party integrations and plugins',
          targetDate: '2024-04-01',
          status: 'pending',
          features: [
            'Gmail Plugin',
            'SMS Integration',
            'Plugin Management'
          ],
          dependencies: ['Reporting System']
        }
      ]
    }
  ],
  integrations: {
    authentication: 'Firebase Auth',
    database: 'Firebase Database',
    hosting: 'Vercel',
    ocr: 'Mindee OCR',
    banking: 'Teller API',
    ai: 'ChatGPT API',
    storage: 'Dropbox API'
  },
  pages: {
    dashboard: {
      name: 'Dashboard',
      route: '/',
      status: 'in-progress',
      features: [
        {
          name: 'Recent Expenses Overview',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Receipt Sync Status',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Report Summary',
          status: 'pending',
          priority: 'medium'
        }
      ]
    },
    expenses: {
      name: 'Expenses',
      route: '/expenses',
      status: 'in-progress',
      features: [
        {
          name: 'Live Bank Feed',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Receipt Matching',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Manual Entry',
          status: 'completed',
          priority: 'high'
        },
        {
          name: 'Auto Categorization',
          status: 'pending',
          priority: 'medium'
        }
      ]
    },
    reports: {
      name: 'Reports',
      route: '/reports',
      status: 'in-progress',
      features: [
        {
          name: 'Report Creation',
          status: 'in-progress',
          priority: 'high'
        },
        {
          name: 'Receipt Validation',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Export Functionality',
          status: 'pending',
          priority: 'medium'
        }
      ]
    },
    receipts: {
      name: 'Receipts',
      route: '/receipts',
      status: 'pending',
      features: [
        {
          name: 'Batch Upload',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Gmail Plugin',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'SMS Integration',
          status: 'pending',
          priority: 'medium'
        },
        {
          name: 'OCR Processing',
          status: 'pending',
          priority: 'high'
        }
      ]
    },
    settings: {
      name: 'Settings',
      route: '/settings',
      status: 'pending',
      features: [
        {
          name: 'Bank Integration',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'API Configuration',
          status: 'pending',
          priority: 'high'
        },
        {
          name: 'Plugin Management',
          status: 'pending',
          priority: 'medium'
        }
      ]
    }
  }
};

module.exports = {
  PROJECT_DEFINITION
}; 