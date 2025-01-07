# Expense Splitting Components

This directory contains components for handling expense splitting functionality in the expense tracker application.

## Components

### 1. SplitExpenseModal
A modal dialog for splitting expenses between business and personal use.

```tsx
<SplitExpenseModal
  isOpen={boolean}
  onClose={() => void}
  onSplit={(splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void}
  amount={number}
  description={string}
/>
```

Features:
- Percentage slider for easy splitting
- Manual amount inputs for precise control
- Real-time calculation of split amounts
- Form validation with zod
- Responsive design

### 2. ExpenseActions
A dropdown menu component for expense actions, including split functionality.

```tsx
<ExpenseActions
  expense={Expense}
  onEdit={(expense: Expense) => void}
  onDelete={(expense: Expense) => void}
  onSplit={(splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void}
  onViewReceipt={(expense: Expense) => void}
/>
```

Features:
- Split action with modal integration
- Edit and delete actions
- Receipt viewing
- Smart handling of split eligibility

### 3. ExpenseList
A table component that displays expenses with split functionality.

```tsx
<ExpenseList
  expenses={Expense[]}
  onEdit={(expense: Expense) => void}
  onDelete={(expense: Expense) => void}
  onSplit={(expense: Expense, splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void}
  onViewReceipt={(expense: Expense) => void}
/>
```

Features:
- Tabular display of expenses
- Split status indicators
- Category and status badges
- Integrated actions menu
- Empty state handling

## Usage Example

```tsx
import { ExpenseList } from '@/components/expenses/ExpenseList';

export default function ExpensesPage() {
  const handleSplit = (expense: Expense, splits: Array<{ amount: number; type: 'business' | 'personal' }>) => {
    // Handle the split
    const [business, personal] = splits;
    console.log(`Splitting expense ${expense.id}:`);
    console.log('Business:', business.amount);
    console.log('Personal:', personal.amount);
  };

  return (
    <ExpenseList
      expenses={expenses}
      onSplit={handleSplit}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewReceipt={handleViewReceipt}
    />
  );
}
```

## Database Schema

The components expect expenses to have the following fields:
- `id`: Unique identifier
- `amount`: Numeric amount
- `description`: String description
- `date`: Date of expense
- `category`: Category string
- `merchant`: Optional merchant name
- `status`: Status string
- `split_from_id`: Optional reference to parent expense if split
- `has_splits`: Boolean indicating if expense has been split
- `receipt_id`: Optional reference to attached receipt

## Styling

The components use:
- Tailwind CSS for styling
- shadcn/ui components
- Lucide icons
- Custom paper-like effects for receipts

## Dependencies

Required packages:
- @hookform/resolvers
- react-hook-form
- zod
- date-fns
- lucide-react
- @radix-ui/react-dialog
- @radix-ui/react-slider
- tailwindcss

## Notes

1. Split expenses are tracked through the `split_from_id` field, creating a parent-child relationship.
2. The `has_splits` field prevents double-splitting of expenses.
3. The UI automatically adapts to show split status and disable split actions where appropriate.
4. All amounts are handled with proper decimal precision for currency. 