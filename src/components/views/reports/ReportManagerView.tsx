'use client';

import { useState } from 'react';
import { useReports } from '@/lib/hooks/useReports';
import { ReportList } from '@/components/views/reports/ReportList';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { AddReportDialog } from './AddReportDialog';
import { Spinner } from '@/components/ui/spinner';

export function ReportManagerView() {
  const { reports, isLoading, error, refetchReports } = useReports();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load reports</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your expense reports
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <ReportList reports={reports} />

      <AddReportDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetchReports();
        }}
      />
    </div>
  );
} 