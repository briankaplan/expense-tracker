'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EyeOpenIcon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import type { Report } from '@/types/reports';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ReportListProps {
  reports: Report[];
  onView?: (report: Report) => void;
  onDownload?: (report: Report) => void;
  onDelete?: (report: Report) => void;
}

export function ReportList({ reports, onView, onDownload, onDelete }: ReportListProps) {
  if (!reports.length) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No reports found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-lg border">
      <div className="p-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="mb-4 flex items-center justify-between rounded-lg border p-4 last:mb-0"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{report.title}</span>
                <Badge
                  variant={
                    report.status === 'approved'
                      ? 'success'
                      : report.status === 'rejected'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {report.status}
                </Badge>
                <Badge variant="outline">{report.type}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </span>
                <span>{formatCurrency(report.totalAmount)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(report)}
                  title="View Report"
                >
                  <EyeOpenIcon className="h-4 w-4" />
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(report)}
                  title="Download Report"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              )}
              {onDelete && report.status === 'draft' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(report)}
                  title="Delete Report"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 