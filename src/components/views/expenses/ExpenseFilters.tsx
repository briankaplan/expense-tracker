'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Filter,
  Receipt,
  MessageSquare,
  DollarSign,
  Store,
  Tag,
  X,
  SlidersHorizontal,
  Keyboard
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExpenseFiltersProps {
  filters: {
    type?: 'business' | 'personal' | 'all';
    missingReceipts?: boolean;
    missingComments?: boolean;
    priceRange?: { min?: number; max?: number };
    merchant?: string;
    category?: string;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
  stats: {
    missingReceipts: number;
    missingComments: number;
  };
}

export function ExpenseFilters({ filters, onFilterChange, stats }: ExpenseFiltersProps) {
  const clearFilters = () => {
    onFilterChange({
      type: 'all',
      missingReceipts: false,
      missingComments: false,
      priceRange: undefined,
      merchant: '',
      category: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== false);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <Receipt className="h-4 w-4" />
          <span className="text-sm font-medium">
            {stats.missingReceipts} Missing Receipts
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">
            {stats.missingComments} Missing Descriptions
          </span>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search merchant, description, or category..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-8"
        />
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="flex gap-2">
        <Button
          variant={filters.missingReceipts ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange({ 
            ...filters, 
            missingReceipts: !filters.missingReceipts 
          })}
          className="flex-1"
        >
          <Receipt className="h-4 w-4 mr-2" />
          Missing Receipts
        </Button>
        <Button
          variant={filters.missingComments ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange({ 
            ...filters, 
            missingComments: !filters.missingComments 
          })}
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Missing Descriptions
        </Button>
      </div>

      {/* Advanced Filters in Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Active
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value: 'business' | 'personal' | 'all') => 
                    onFilterChange({ ...filters, type: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="business">Business Only</SelectItem>
                    <SelectItem value="personal">Personal Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      priceRange: {
                        ...filters.priceRange,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      priceRange: {
                        ...filters.priceRange,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="Filter by category..."
                  value={filters.category || ''}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input
                  placeholder="Filter by merchant..."
                  value={filters.merchant || ''}
                  onChange={(e) => onFilterChange({ ...filters, merchant: e.target.value })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shortcuts" className="border-none">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Navigation</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Next Expense</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">↓ or J</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Expense</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">↑ or K</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Mark as Business</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Mark as Personal</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">P</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Upload Receipt</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">U</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Add Comment</span>
                    <kbd className="px-2 py-0.5 bg-muted rounded">C</kbd>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2">
          <div className="text-sm text-muted-foreground">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.type && filters.type !== 'all' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, type: undefined })}
              >
                {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.missingReceipts && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, missingReceipts: false })}
              >
                Missing Receipts
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.missingComments && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, missingComments: false })}
              >
                Missing Descriptions
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.priceRange?.min && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ 
                  ...filters, 
                  priceRange: { ...filters.priceRange, min: undefined }
                })}
              >
                Min: ${filters.priceRange.min}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.priceRange?.max && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ 
                  ...filters, 
                  priceRange: { ...filters.priceRange, max: undefined }
                })}
              >
                Max: ${filters.priceRange.max}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.merchant && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, merchant: '' })}
              >
                Merchant: {filters.merchant}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.category && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, category: '' })}
              >
                Category: {filters.category}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            {filters.search && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange({ ...filters, search: '' })}
              >
                Search: {filters.search}
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 