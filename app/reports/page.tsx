'use client';

import { ReportView } from '@/components/views/reports/ReportView';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ExpenseReport } from '@/types/expenses';

// TODO: Replace with actual data fetching
const mockReports: ExpenseReport[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    type: 'business',
    expenseIds: ['1', '2', '3'],
    totalAmount: 1234.56,
    status: 'submitted',
    submittedBy: 'user@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'personal',
    expenseIds: ['4', '5'],
    totalAmount: 567.89,
    status: 'approved',
    submittedBy: 'user@example.com',
    approvedBy: 'manager@example.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export default function ReportsPage() {
  const handleViewReport = useCallback((reportId: string) => {
    // TODO: Implement report viewing
    toast.success(`Viewing report ${reportId}`);
  }, []);

  const handleDownloadReport = useCallback((reportId: string) => {
    // TODO: Implement report download
    toast.success(`Downloading report ${reportId}`);
  }, []);

  const handleApproveReport = useCallback((reportId: string) => {
    // TODO: Implement report approval
    toast.success(`Report ${reportId} approved`);
  }, []);

  const handleRejectReport = useCallback((reportId: string) => {
    // TODO: Implement report rejection
    toast.success(`Report ${reportId} rejected`);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Expense Reports</h1>
      <ReportView
        reports={mockReports}
        onViewReport={handleViewReport}
        onDownloadReport={handleDownloadReport}
        onApproveReport={handleApproveReport}
        onRejectReport={handleRejectReport}
      />
    </div>
  );
} 