'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/ui/date-input';
import { 
  Upload,
  Receipt,
  Calendar,
  DollarSign,
  CreditCard,
  Tag,
  MessageSquare,
  Image as ImageIcon,
  Briefcase,
  Home,
  Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type?: 'business' | 'personal';
    memo?: string;
    receipt?: File;
    source: 'manual' | 'import';
    paymentMethod: 'credit' | 'checking' | 'cash';
  }) => void;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit
}: AddExpenseDialogProps) {
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'checking' | 'cash'>('credit');
  const [type, setType] = useState<'business' | 'personal' | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !amount) return;

    setIsUploading(true);
    try {
      await onSubmit({
        date: date.toISOString(),
        description,
        amount: parseFloat(amount),
        category,
        memo,
        receipt: receipt || undefined,
        source: 'manual',
        paymentMethod,
        type
      });

      onOpenChange(false);
      resetForm();
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setDate(undefined);
    setDescription('');
    setAmount('');
    setCategory('');
    setMemo('');
    setReceipt(null);
    setPaymentMethod('credit');
    setType(undefined);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setReceipt(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5" />
            Add Manual Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Main Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <DateInput
                  value={date}
                  onChange={setDate}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Description
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: 'credit' | 'checking' | 'cash') => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Memo
              </Label>
              <Input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={type === 'business' ? 'default' : 'outline'}
                  className={cn(
                    'w-full',
                    type === 'business' && 'bg-blue-500 hover:bg-blue-600'
                  )}
                  onClick={() => setType(type === 'business' ? undefined : 'business')}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Business
                </Button>
                <Button
                  type="button"
                  variant={type === 'personal' ? 'default' : 'outline'}
                  className={cn(
                    'w-full',
                    type === 'personal' && 'bg-orange-500 hover:bg-orange-600'
                  )}
                  onClick={() => setType(type === 'personal' ? undefined : 'personal')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Personal
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Receipt Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Receipt
            </Label>
            
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-lg transition-colors",
                dragActive ? "border-primary bg-primary/5" : "hover:border-primary/50",
                previewUrl ? "aspect-[3/4]" : "aspect-square"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setReceipt(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag and drop your receipt here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to select a file
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Supports: JPEG, PNG, HEIC, PDF
            </div>
          </div>

          {/* Footer */}
          <div className="md:col-span-2 flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 