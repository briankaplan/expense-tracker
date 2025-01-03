# File Mapping from Reference

## Core Files
- [x] app/layout.tsx
- [x] app/page.tsx (redirect to /expenses)

## Layout Components
- [x] src/components/views/layout/AppShell.tsx
- [x] src/components/views/layout/MainLayout.tsx
- [x] src/components/views/layout/Header.tsx
- [x] src/components/views/layout/Sidebar.tsx

## Pages & Views
- [x] app/expenses/page.tsx
- [x] app/subscriptions/page.tsx
- [x] app/upload/layout.tsx
- [x] app/upload/page.tsx
- [x] src/components/views/expenses/ExpenseManagerView.tsx
- [x] src/components/views/subscriptions/SubscriptionsView.tsx
- [x] src/components/views/upload/UploadView.tsx

## UI Components
- [x] src/components/ui/Card.tsx
- [ ] src/components/ui/Button.tsx
- [ ] src/components/ui/Input.tsx
- [ ] src/components/ui/Select.tsx
- [ ] src/components/ui/Dialog.tsx
- [ ] src/components/ui/DatePicker.tsx
- [ ] src/components/ui/Badge.tsx

## Context & Providers
- [x] src/lib/context/QueryProvider.tsx
- [ ] src/lib/context/AuthContext.tsx

## Services & Utils
- [ ] src/lib/services/expenses.ts
- [ ] src/lib/services/subscriptions.ts
- [ ] src/lib/utils/format.ts

## Dependencies to Install
```json
{
  "@headlessui/react": "latest",
  "@heroicons/react": "latest",
  "@tanstack/react-query": "latest",
  "date-fns": "latest",
  "react-hot-keys": "latest"
}
``` 