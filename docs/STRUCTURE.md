# Project Structure

```
expense-tracker/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   └── views/                 # Feature-specific views
│   │       ├── layout/
│   │       │   ├── AppShell.tsx   # Main app wrapper
│   │       │   ├── Header.tsx     # Top navigation
│   │       │   └── Sidebar.tsx    # Side navigation
│   │       ├── expenses/
│   │       │   ├── ExpenseManagerView.tsx
│   │       │   ├── ExpenseList.tsx
│   │       │   └── ExpenseSummary.tsx
│   │       └── subscriptions/
│   │           ├── SubscriptionsView.tsx
│   │           └── SubscriptionCard.tsx
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts          # Firebase initialization
│       │   └── admin.ts           # Admin SDK config
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useExpenses.ts
│       │   └── useSubscriptions.ts
│       ├── services/
│       │   ├── expenses.ts
│       │   └── subscriptions.ts
│       └── utils/
│           └── format.ts
├── app/                           # Next.js app router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page (redirect)
│   ├── expenses/
│   │   └── page.tsx
│   ├── subscriptions/
│   │   └── page.tsx
│   └── upload/
│       ├── layout.tsx
│       └── page.tsx
└── docs/                          # Documentation
    ├── STRUCTURE.md
    └── PHASES.md
```

## Key Rules:
1. No nested 'components' folders
2. All UI components in `src/components/ui`
3. Feature components in `src/components/views/{feature}`
4. All imports should use `@/src/` prefix