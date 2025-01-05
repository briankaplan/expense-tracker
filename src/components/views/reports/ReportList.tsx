'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { OpenReport } from './OpenReport';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Search, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useReports } from '@/contexts/ReportsContext';

interface ReportListProps {
  type: 'business' | 'personal';
  showClosed: boolean;
}

export function ReportList({ type, showClosed }: ReportListProps) {
  const { reports, closeReport } = useReports();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleExport = async (reportId: string) => {
    // TODO: Implement export functionality
    console.log('Exporting report:', reportId);
  };

  const handleOpenReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const handleCloseReport = async (reportId: string) => {
    await closeReport(reportId);
    setSelectedReport(null);
  };

  const typeFilteredReports = reports.filter(report => report.type === type);

  const filteredReports = typeFilteredReports.filter(report => {
    if (!showClosed && report.status === 'closed') return false;
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesId = report.id.toLowerCase().includes(searchLower);
      const matchesMerchant = Object.keys(report.merchants).some(
        merchant => merchant.toLowerCase().includes(searchLower)
      );
      if (!matchesId && !matchesMerchant) return false;
    }

    if (dateRange?.from) {
      const reportDate = new Date(report.dateCreated);
      if (reportDate < dateRange.from) return false;
      if (dateRange.to && reportDate > dateRange.to) return false;
    }

    return true;
  });

  const openReports = filteredReports.filter(r => r.status === 'open');
  const closedReports = filteredReports.filter(r => r.status === 'closed');

  const totalAmount = filteredReports.reduce((sum, report) => sum + report.totalAmount, 0);
  const totalExpenses = filteredReports.reduce((sum, report) => sum + report.expenseCount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Reports</div>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold">{totalExpenses}</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <DateRangePicker
          date={dateRange}
          onSelect={setDateRange}
          className="w-[300px]"
        />
      </div>

      {/* Open Reports Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Open Reports</h2>
        <div className="grid gap-4">
          {openReports.map((report) => (
            <ReportCard
              key={report.id}
              {...report}
              onOpen={handleOpenReport}
            />
          ))}
          {openReports.length === 0 && (
            <p className="text-sm text-muted-foreground">No open reports</p>
          )}
        </div>
      </div>

      {/* Closed Reports Section */}
      {showClosed && closedReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Closed Reports</h2>
          <div className="grid gap-4">
            {closedReports.map((report) => (
              <ReportCard
                key={report.id}
                {...report}
                onOpen={handleOpenReport}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Report View */}
      {selectedReport && (
        <OpenReport
          {...reports.find(r => r.id === selectedReport)!}
          onClose={handleCloseReport}
          onExport={() => handleExport(selectedReport)}
        />
      )}
    </div>
  );
} 