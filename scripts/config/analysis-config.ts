export const ANALYSIS_CONFIG = {
  criticalPaths: [
    'src/components/views/reports',
    'src/contexts',
    'src/lib/utils'
  ],
  riskThresholds: {
    high: {
      dependencies: 10,
      depth: 5,
      impact: 8
    },
    medium: {
      dependencies: 5,
      depth: 3,
      impact: 4
    }
  },
  ignorePaths: [
    'node_modules',
    'dist',
    '.next',
    'scripts'
  ],
  requireTests: [
    'src/components/views/reports/*.tsx',
    'src/contexts/*.tsx'
  ]
};

export const VERIFICATION_RULES = {
  structure: {
    maxDepth: 4,
    requiredDirs: [
      'src/components/views/reports',
      'src/contexts',
      'src/types'
    ]
  },
  dependencies: {
    maxPerFile: 15,
    maxIndirectDeps: 20,
    criticalFiles: [
      'ReportsContext.tsx',
      'ReportsView.tsx'
    ]
  },
  testing: {
    coverageThreshold: 80,
    requiredTypes: [
      'unit',
      'integration'
    ],
    patterns: {
      unit: '__tests__/unit/**/*.test.tsx',
      integration: '__tests__/integration/**/*.test.tsx'
    },
    testFiles: {
      unit: [
        'components/views/reports/*.tsx',
        'contexts/*.tsx'
      ],
      integration: [
        'components/views/reports/ReportsView.tsx',
        'components/views/reports/OpenReport.tsx'
      ]
    }
  }
}; 