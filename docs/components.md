# Component Documentation

## Core Components

### SubscriptionsView

The main view component for managing subscriptions.

```typescript
import { SubscriptionsView } from '@/components/views/subscriptions/SubscriptionsView';
```

**Features:**
- Subscription list display
- Filtering and search
- Stats overview
- Intelligence panel
- Add/Edit functionality

**Props:** None (manages own state)

**State:**
- `subscriptions`: Array of subscriptions
- `filters`: Search and filter states
- `dialog`: Dialog visibility states

### SubscriptionCard

Individual subscription display component with animations and interactions.

```typescript
import { SubscriptionCard } from '@/components/views/subscriptions/SubscriptionCard';
```

**Props:**
```typescript
interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onFindAlternatives: (subscription: Subscription) => void;
}
```

**Features:**
- Logo display
- Subscription details
- Interactive buttons
- Hover animations
- Website link

### SubscriptionDialog

Dialog for adding and editing subscriptions.

```typescript
import { SubscriptionDialog } from '@/components/views/subscriptions/SubscriptionDialog';
```

**Props:**
```typescript
interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onClose: () => void;
}
```

**Features:**
- Form validation
- Logo preview
- Website input
- Category selection
- Frequency selection

## Intelligence Components

### SubscriptionLogo

Smart logo component with multiple sources and fallbacks.

```typescript
import { SubscriptionLogo } from '@/components/ui/subscription-logo';
```

**Props:**
```typescript
interface SubscriptionLogoProps {
  name: string;
  domain?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
}
```

**Features:**
- Multiple logo sources
- Loading states
- Error handling
- Size variants
- Custom fallback

### SubscriptionNotifications

Smart notification component for subscription alerts.

```typescript
import { SubscriptionNotifications } from '@/components/views/subscriptions/SubscriptionNotifications';
```

**Props:**
```typescript
interface SubscriptionNotificationsProps {
  subscriptions: Subscription[];
}
```

**Features:**
- Trial ending alerts
- Renewal notifications
- Usage alerts
- Priority levels
- Interactive actions

## Hooks

### useSubscriptionIntelligence

Hook for accessing AI-powered subscription analysis.

```typescript
import { useSubscriptionIntelligence } from '@/lib/hooks/useSubscriptionIntelligence';
```

**Usage:**
```typescript
const {
  isAnalyzing,
  analysis,
  analyzeSubscriptions,
  findAlternatives,
} = useSubscriptionIntelligence({
  subscriptions,
  onUpdate: () => void,
});
```

**Features:**
- Subscription analysis
- Cost optimization
- Alternative finding
- Pattern detection

### useSubscriptionLogo

Hook for managing logo fetching and caching.

```typescript
import { useSubscriptionLogo } from '@/lib/hooks/useSubscriptionLogo';
```

**Usage:**
```typescript
const {
  logo,
  isLoading,
  error,
  refetch,
} = useSubscriptionLogo(name, domain);
```

**Features:**
- Logo fetching
- Cache management
- Error handling
- Loading states

### useSubscriptionNotifications

Hook for managing subscription alerts and notifications.

```typescript
import { useSubscriptionNotifications } from '@/lib/hooks/useSubscriptionNotifications';
```

**Usage:**
```typescript
const {
  alerts,
  checkForAlerts,
  clearAlert,
  clearAllAlerts,
} = useSubscriptionNotifications(subscriptions);
```

**Features:**
- Alert generation
- Priority management
- Alert clearing
- Periodic checks

## Services

### logoService

Service for handling logo detection and fetching.

```typescript
import { getSubscriptionLogo, clearLogoCache } from '@/lib/services/logoService';
```

**Features:**
- Multiple logo sources
- AI-powered domain detection
- Caching system
- Quality prioritization

### subscriptionDetection

Service for detecting and analyzing subscriptions.

```typescript
import {
  detectSubscriptionsFromEmails,
  detectSubscriptionsFromReceipts,
  analyzeSubscriptionPattern,
} from '@/lib/services/subscriptionDetection';
```

**Features:**
- Email analysis
- Receipt analysis
- Pattern detection
- AI-powered categorization

## Utility Components

### Badge

```typescript
import { Badge } from '@/components/ui/badge';
```

**Variants:**
- `default`
- `secondary`
- `destructive`

### Button

```typescript
import { Button } from '@/components/ui/button';
```

**Variants:**
- `default`
- `outline`
- `ghost`
- `link`

### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

**Usage:**
- Subscription cards
- Stats cards
- Intelligence panel

### Select

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

**Usage:**
- Category selection
- Frequency selection
- Status selection 