'use client';

import { useState, useCallback } from 'react';
import { ReportCard } from './ReportCard';
import { OpenReport } from './OpenReport';
import { useToast } from '@/components/ui/use-toast';
import { generateReport, exportReport } from '@/lib/services/reports';

interface Report {
  id: string;
  type: 'business' | 'personal';
  status: 'open' | 'closed';
  totalAmount: number;
  expenseCount: number;
  missingReceipts: number;
  missingComments: number;
  dateCreated: string;
  dateClosed?: string;
  categories: { [key: string]: number };
  merchants: { [key: string]: number };
}

interface ReportListProps {
  type: 'business' | 'personal';
  showClosed: boolean;
}

export function ReportList({ type, showClosed }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const { toast } = useToast();

  const handleGenerateReport = useCallback(async () => {
    try {
      const newReport = await generateReport(type);
      setReports(prev => [...prev, newReport]);
      toast({
        title: 'Report Generated',
        description: `Successfully generated ${type} report.`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [type, toast]);

  const handleExportReport = useCallback(async (id: string) => {
    try {
      await exportReport(id);
      toast({
        title: 'Report Exported',
        description: 'Report has been exported successfully.',
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleApproveReport = useCallback(async (id: string) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === id 
          ? { ...report, status: 'closed', dateClosed: new Date().toISOString() }
          : report
      ));
      toast({
        title: 'Report Approved',
        description: 'Report has been approved and closed.',
      });
    } catch (error) {
      console.error('Failed to approve report:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleRejectReport = useCallback(async (id: string) => {
    try {
      setReports(prev => prev.filter(report => report.id !== id));
      toast({
        title: 'Report Rejected',
        description: 'Report has been rejected and removed.',
      });
    } catch (error) {
      console.error('Failed to reject report:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject report. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const openReports = reports.filter(report => 
    report.type === type && report.status === 'open'
  );

  const closedReports = reports.filter(report => 
    report.type === type && report.status === 'closed'
  );

  return (
    <div className="space-y-6">
      {/* Open Reports Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Open Reports</h2>
        {openReports.length === 0 ? (
          <OpenReport type={type} onGenerate={handleGenerateReport} />
        ) : (
          <div className="grid gap-4">
            {openReports.map(report => (
              <ReportCard
                key={report.id}
                {...report}
                onExport={handleExportReport}
                onApprove={handleApproveReport}
                onReject={handleRejectReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Closed Reports Section */}
      {showClosed && closedReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Closed Reports</h2>
          <div className="grid gap-4">
            {closedReports.map(report => (
              <ReportCard
                key={report.id}
                {...report}
                onExport={handleExportReport}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 