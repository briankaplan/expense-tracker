# Expense Tracker - Project Structure

## Application Structure
```
expense-tracker/
├── src/
│   ├── components/
│   │   ├── ui/          # Shared UI components
│   │   └── views/       # Page-specific components
│   │       ├── layout/
│   │       │   ├── AppShell.tsx
│   │       │   ├── MainLayout.tsx
│   │       │   ├── Header.tsx
│   │       │   └── Sidebar.tsx
│   │       ├── expenses/
│   │       │   ├── ExpenseManagerView.tsx
│   │       │   └── components/
│   │       └── subscriptions/
│   │           ├── SubscriptionsView.tsx
│   │           └── components/
│   └── lib/
│       ├── context/     # React contexts
│       ├── hooks/       # Custom hooks
│       └── utils/       # Utility functions
├── app/
│   ├── expenses/
│   ├── subscriptions/
│   └── upload/
└── public/
```

## Key Features (based on reference implementation)
1. Layout & Navigation
   - [x] AppShell with MainLayout
   - [x] Responsive Sidebar
   - [x] Header with user menu
   - [ ] Dark mode support

2. Expenses Management
   - [ ] List view with filtering
   - [ ] Add/Edit expenses
   - [ ] Receipt management
   - [ ] CSV import/export

3. Subscriptions Management
   - [ ] Subscription tracking
   - [ ] Recurring payments
   - [ ] Notifications

4. Upload Functionality
   - [ ] Receipt upload
   - [ ] Batch processing
   - [ ] OCR integration

## Implementation Progress
1. Layout Components ✓
   - [x] AppShell
   - [x] MainLayout
   - [x] Sidebar
   - [x] Header

2. Next Steps
   - [ ] ExpenseManagerView
   - [ ] SubscriptionsView
   - [ ] Upload layout 