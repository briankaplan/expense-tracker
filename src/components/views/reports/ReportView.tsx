'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExpenseReport } from '@/types/expenses';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReportViewProps {
  reports: ExpenseReport[];
  onViewReport: (reportId: string) => void;
  onDownloadReport: (reportId: string) => void;
  onApproveReport: (reportId: string) => void;
  onRejectReport: (reportId: string) => void;
}

export function ReportView({
  reports,
  onViewReport,
  onDownloadReport,
  onApproveReport,
  onRejectReport,
}: ReportViewProps) {
  const [filter, setFilter] = useState<ExpenseReport['status'] | 'all'>('all');
  const [type, setType] = useState<ExpenseReport['type'] | 'all'>('all');

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus = filter === 'all' || report.status === filter;
      const matchesType = type === 'all' || report.type === type;
      return matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, filter, type]);

  const stats = useMemo(() => {
    const total = reports.reduce((sum, report) => sum + report.totalAmount, 0);
    const pending = reports.filter(r => r.status === 'submitted').length;
    const approved = reports.filter(r => r.status === 'approved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [reports]);

  const getStatusColor = (status: ExpenseReport['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-500';
      case 'submitted': return 'text-blue-500';
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ExpenseReport['status']) => {
    switch (status) {
      case 'draft': return <Clock className="h-5 w-5" />;
      case 'submitted': return <FileText className="h-5 w-5" />;
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(stats.total)}</p>
          <p className="text-xs text-muted-foreground">{reports.length} reports</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Review</h3>
          <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">reports awaiting approval</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
          <p className="mt-2 text-2xl font-bold">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">reports approved</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Rejected</h3>
          <p className="mt-2 text-2xl font-bold">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">reports rejected</p>
        </Card>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          className="rounded-md border px-3 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ExpenseReport['status'] | 'all')}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="rounded-md border px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value as ExpenseReport['type'] | 'all')}
        >
          <option value="all">All Types</option>
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                  </span>
                  <h3 className="font-medium">
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Created on {formatDate(report.createdAt)}
                </p>
                <p className="text-sm font-medium">
                  {formatCurrency(report.totalAmount)} • {report.expenseIds.length} expenses
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport(report.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadReport(report.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {report.status === 'submitted' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApproveReport(report.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRejectReport(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No reports found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
} 