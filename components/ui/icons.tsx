import {
  Upload,
  Loader2,
  Receipt,
  CreditCard,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
  AlertCircle,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  upload: Upload,
  spinner: Loader2,
  receipt: Receipt,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  calendar: Calendar,
  settings: Settings,
  logout: LogOut,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  plus: Plus,
  close: X,
  check: Check,
  alert: AlertCircle,
  file: FileText,
} as const; 