'use client';

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useHotkeys } from 'react-hotkeys-hook'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

interface FastViewerProps {
  expenses: Array<{
    id: string
    date: string
    description: string
    amount: number
    category?: string
    type?: 'business' | 'personal'
  }>
  onUpdateExpense: (id: string, updates: any) => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FastViewer({ expenses, onUpdateExpense, open, onOpenChange }: FastViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const uncategorizedExpenses = expenses.filter(e => !e.type)

  const handleUpdateType = useCallback(async (type: 'business' | 'personal' | 'skip') => {
    const currentExpense = uncategorizedExpenses[currentIndex]
    if (!currentExpense || type === 'skip') {
      setCurrentIndex(i => i + 1)
      return
    }

    try {
      await onUpdateExpense(currentExpense.id, { type })
      toast({
        title: "Category Updated",
        description: `Expense marked as ${type}.`,
      });
      setCurrentIndex(i => i + 1)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update expense category. Please try again.",
      });
      console.error('Failed to update expense:', error)
      toast.error('Failed to update expense')
    }
  }, [currentIndex, uncategorizedExpenses, onUpdateExpense])

  // Keyboard shortcuts
  useHotkeys('b', () => handleUpdateType('business'), [handleUpdateType])
  useHotkeys('p', () => handleUpdateType('personal'), [handleUpdateType])
  useHotkeys('s', () => handleUpdateType('skip'), [handleUpdateType])
  useHotkeys('left', () => setCurrentIndex(i => Math.max(0, i - 1)), [])
  useHotkeys('right', () => setCurrentIndex(i => Math.min(uncategorizedExpenses.length - 1, i + 1)), [uncategorizedExpenses.length])

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(0)
    }
  }, [open])

  const currentExpense = uncategorizedExpenses[currentIndex]

  const handleKeyPress = async (type: ExpenseType | null) => {
    if (!currentExpense) return;

    try {
      if (type) {
        await onUpdateExpense(currentExpense.id, { type });
        toast({
          title: "Category Updated",
          description: `Expense marked as ${type}.`,
        });
      }
      
      // Move to next expense
      setCurrentIndex(prev => Math.min(prev + 1, expenses.length - 1));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update expense category. Please try again.",
      });
    }
  };

  const handleSkip = () => {
    setCurrentIndex(prev => Math.min(prev + 1, expenses.length - 1));
    toast({
      title: "Skipped",
      description: "Moved to next expense.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!currentExpense ? (
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              All expenses have been categorized!
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Expense {currentIndex + 1} of {uncategorizedExpenses.length}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick categorize your expenses (B = Business, P = Personal, S = Skip)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-lg">{currentExpense.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-lg">{formatCurrency(currentExpense.amount)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-lg">
                    {new Date(currentExpense.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => handleUpdateType('business')}
                  >
                    Business (B)
                  </Button>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => handleUpdateType('personal')}
                  >
                    Personal (P)
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateType('skip')}
                >
                  Skip (S)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(i => Math.min(uncategorizedExpenses.length - 1, i + 1))}
                  disabled={currentIndex === uncategorizedExpenses.length - 1}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
} 