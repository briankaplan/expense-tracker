export const CATEGORIES = [
  { label: 'Software', value: 'software' },
  { label: 'Streaming', value: 'streaming' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Memberships', value: 'memberships' },
  { label: 'Other', value: 'other' },
] as const;

export const FREQUENCIES = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
] as const;

export const SUBSCRIPTION_STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Trial', value: 'trial' },
] as const; 