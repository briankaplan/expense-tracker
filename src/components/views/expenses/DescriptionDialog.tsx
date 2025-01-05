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

interface DescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string;
  currentDescription?: string;
  onUpdateDescription: (expenseId: string, description: string) => Promise<void>;
}

export function DescriptionDialog({
  open,
  onOpenChange,
  expenseId,
  currentDescription = '',
  onUpdateDescription
}: DescriptionDialogProps) {
  const [description, setDescription] = useState(currentDescription);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateDescription(expenseId, description);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Description</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this expense..."
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