'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string;
  currentMemo?: string;
  onUpdateMemo: (expenseId: string, memo: string) => Promise<void>;
}

export function MemoDialog({
  open,
  onOpenChange,
  expenseId,
  currentMemo = '',
  onUpdateMemo
}: MemoDialogProps) {
  const [memo, setMemo] = useState(currentMemo);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateMemo(expenseId, memo);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Memo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memo">Memo</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add notes about this expense..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 