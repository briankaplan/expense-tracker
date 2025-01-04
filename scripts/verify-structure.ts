import { chalk, joinPath, checkDirectory, checkFile } from './utils/fs-helpers';

// Type definitions for the project structure
type ComponentFiles = {
  ui: string[];
  forms: string[];
  layouts: string[];
}

type FeatureFiles = {
  expenses: string[];
  dashboard: string[];
}

type ProjectFiles = {
  core: string[];
  components: ComponentFiles;
  features: FeatureFiles;
  pages: string[];
  integrations: string[];
  store: string[];
}

const REQUIRED_PATHS = {
  directories: [
    // Core App Structure
    'src',
    'app',
    'public',
    
    // Component Layer
    'src/components',
    'src/components/ui',           // Reusable UI components
    'src/components/forms',        // Form-specific components
    'src/components/layouts',      // Layout components
    'src/components/shared',       // Shared components
    
    // Feature Modules
    'src/features',
    'src/features/expenses',       // Expense management
    'src/features/receipts',       // Receipt handling
    'src/features/subscriptions',  // Subscription tracking
    'src/features/dashboard',      // Dashboard features
    'src/features/reports',        // Reporting features
    'src/features/settings',       // User settings
    'src/features/auth',          // Authentication
    
    // Core Infrastructure
    'src/lib',
    'src/lib/db',                 // Database layer
    'src/lib/api',                // API utilities
    'src/lib/config',             // Configuration
    'src/lib/utils',              // Utilities
    'src/lib/hooks',              // Custom hooks
    'src/lib/context',            // React context
    'src/lib/types',              // TypeScript types
    
    // Integration Layer
    'src/integrations',
    'src/integrations/ai',        // AI/ML features
    'src/integrations/nexus',     // Nexus integration
    'src/integrations/teller',    // Banking integration
    'src/integrations/supabase',  // Database
    'src/integrations/storage',   // Storage solutions
    'src/integrations/auth',      // Auth providers
    
    // State Management
    'src/store',                  // Global state
    'src/store/slices',           // State slices
    'src/store/actions',          // Actions
    
    // Testing
    'src/__tests__',
    'src/__tests__/unit',
    'src/__tests__/integration',
    'src/__tests__/e2e'
  ] as const,
  
  files: {
    core: [
      // Core configuration
      'src/lib/config/constants.ts',
      'src/lib/config/environment.ts',
      'src/lib/config/theme.ts',
      'src/lib/config/routes.ts',
      
      // Database
      'src/lib/db/schema.ts',
      'src/lib/db/client.ts',
      'src/lib/db/migrations.ts',
      
      // Type definitions
      'src/lib/types/index.ts',
      'src/lib/types/expenses.ts',
      'src/lib/types/auth.ts',
      
      // Utils
      'src/lib/utils/formatting.ts',
      'src/lib/utils/validation.ts',
      'src/lib/utils/helpers.ts'
    ],
    
    components: {
      ui: [
        'src/components/ui/Button.tsx',
        'src/components/ui/Input.tsx',
        'src/components/ui/Select.tsx',
        'src/components/ui/Card.tsx',
        'src/components/ui/Table.tsx',
        'src/components/ui/Modal.tsx',
        'src/components/ui/Alert.tsx',
        'src/components/ui/Badge.tsx',
        'src/components/ui/Charts.tsx',
        'src/components/ui/DatePicker.tsx',
        'src/components/ui/FileUpload.tsx',
        'src/components/ui/Loading.tsx'
      ],
      
      forms: [
        'src/components/forms/ExpenseForm.tsx',
        'src/components/forms/ReceiptForm.tsx',
        'src/components/forms/SubscriptionForm.tsx',
        'src/components/forms/SettingsForm.tsx'
      ],
      
      layouts: [
        'src/components/layouts/RootLayout.tsx',
        'src/components/layouts/DashboardLayout.tsx',
        'src/components/layouts/AuthLayout.tsx',
        'src/components/layouts/Header.tsx',
        'src/components/layouts/Sidebar.tsx',
        'src/components/layouts/Footer.tsx'
      ]
    },
    
    features: {
      expenses: [
        'src/features/expenses/ExpenseList.tsx',
        'src/features/expenses/ExpenseDetail.tsx',
        'src/features/expenses/ExpenseAnalytics.tsx'
      ],
      dashboard: [
        'src/features/dashboard/Overview.tsx',
        'src/features/dashboard/RecentActivity.tsx',
        'src/features/dashboard/Statistics.tsx'
      ]
    },
    
    pages: [
      // Core pages
      'app/layout.tsx',
      'app/page.tsx',
      'app/error.tsx',
      'app/loading.tsx',
      
      // Feature pages
      'app/dashboard/page.tsx',
      'app/expenses/page.tsx',
      'app/expenses/[id]/page.tsx',
      'app/receipts/page.tsx',
      'app/subscriptions/page.tsx',
      'app/reports/page.tsx',
      'app/settings/page.tsx',
      
      // Auth pages
      'app/auth/login/page.tsx',
      'app/auth/register/page.tsx',
      'app/auth/forgot-password/page.tsx'
    ],
    
    integrations: [
      // AI/ML
      'src/integrations/ai/openai.ts',
      'src/integrations/ai/assistant.ts',
      
      // Banking
      'src/integrations/teller/client.ts',
      'src/integrations/teller/hooks.ts',
      
      // Storage
      'src/integrations/storage/supabase.ts',
      'src/integrations/storage/local.ts',
      
      // Authentication
      'src/integrations/auth/supabase.ts',
      'src/integrations/auth/session.ts'
    ],
    
    store: [
      'src/store/index.ts',
      'src/store/slices/expenses.ts',
      'src/store/slices/auth.ts',
      'src/store/slices/ui.ts',
      'src/store/middleware.ts'
    ]
  } satisfies ProjectFiles
} as const;

export async function verifyStructure(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying project structure...\n'));
  
  let hasErrors = false;

  // Check directories
  console.log(chalk.blue('\nChecking directories:'));
  REQUIRED_PATHS.directories.forEach((dir: string) => {
    const fullPath = joinPath(process.cwd(), dir);
    if (!checkDirectory(fullPath)) {
      console.log(chalk.red(`  ❌ Missing directory: ${dir}`));
      hasErrors = true;
    } else {
      console.log(chalk.green(`  ✓ ${dir}`));
    }
  });

  // Helper function to check files recursively
  const checkFiles = (files: string[] | Record<string, any>, parentCategory = ''): void => {
    if (Array.isArray(files)) {
      files.forEach((file: string) => {
        const fullPath = joinPath(process.cwd(), file);
        if (!checkFile(fullPath)) {
          console.log(chalk.red(`  ❌ Missing file: ${file}`));
          hasErrors = true;
        } else {
          console.log(chalk.green(`  ✓ ${file}`));
        }
      });
    } else {
      Object.entries(files).forEach(([category, value]) => {
        const currentCategory = parentCategory ? `${parentCategory}.${category}` : category;
        console.log(chalk.blue(`\nChecking ${currentCategory} files:`));
        checkFiles(value, currentCategory);
      });
    }
  };

  // Check all files
  checkFiles(REQUIRED_PATHS.files);

  if (hasErrors) {
    console.log(chalk.red('\n❌ Structure verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All required paths exist!\n'));
  }
} 