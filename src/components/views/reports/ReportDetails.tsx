'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Report } from '@/types/reports';

interface ReportDetailsProps {
  report: Report;
  onClose: () => void;
  onExport: () => void;
}

export function ReportDetails({ report, onClose, onExport }: ReportDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report Details</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onExport}>Export</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(report.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge>{report.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(report.dateCreated).toLocaleDateString()}</span>
              </div>
              {report.dateClosed && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Closed</span>
                  <span className="font-medium">{new Date(report.dateClosed).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {Object.entries(report.categories).map(([category, amount]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{category}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {Object.entries(report.merchants)
                .sort(([, a], [, b]) => b - a)
                .map(([merchant, amount]) => (
                  <div key={merchant} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{merchant}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 