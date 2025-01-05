'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, Receipt, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useReports } from '@/contexts/ReportsContext';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpenReportProps {
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
  onClose: (id: string) => void;
}

export function OpenReport({
  id,
  type,
  status,
  totalAmount,
  expenseCount,
  missingReceipts,
  missingComments,
  dateCreated,
  dateClosed,
  categories,
  merchants,
  onClose,
}: OpenReportProps) {
  const { exportReportCSV, exportReportPDF, exportReportReceipts, submitToNetSuite } = useReports();
  const [showNetSuiteDialog, setShowNetSuiteDialog] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formattedDate = format(new Date(dateCreated), 'MMM d, yyyy');
  const formattedClosedDate = dateClosed ? format(new Date(dateClosed), 'MMM d, yyyy') : null;

  const handleExport = async (format: 'csv' | 'pdf' | 'receipts') => {
    try {
      switch (format) {
        case 'csv':
          await exportReportCSV(id);
          break;
        case 'pdf':
          await exportReportPDF(id);
          break;
        case 'receipts':
          await exportReportReceipts(id);
          break;
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      // TODO: Show error toast
    }
  };

  const handleNetSuiteSubmit = async () => {
    if (!employeeEmail) return;
    
    setIsSubmitting(true);
    try {
      await submitToNetSuite(id, employeeEmail);
      setShowNetSuiteDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle>Report #{id}</DialogTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  type === 'business' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as CSV (NetSuite)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('receipts')}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Download Receipts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {status === 'open' && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowNetSuiteDialog(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit to NetSuite
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onClose(id)}
                    >
                      Close Report
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onClose(id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formattedDate}
              {formattedClosedDate && ` • Closed ${formattedClosedDate}`}
            </p>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
              <div className="text-2xl font-bold">{expenseCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Issues</div>
              <div className="flex items-center gap-4 mt-1">
                {missingReceipts > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">{missingReceipts}</span>
                  </div>
                )}
                {missingComments > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{missingComments}</span>
                  </div>
                )}
                {missingReceipts === 0 && missingComments === 0 && (
                  <span className="text-sm text-muted-foreground">No issues</span>
                )}
              </div>
            </Card>
          </div>

          <Tabs defaultValue="categories">
            <TabsList>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(80vh-300px)]">
              <TabsContent value="categories" className="mt-4">
                <div className="space-y-4">
                  {Object.entries(categories).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                      <span className="font-medium">{category}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="merchants" className="mt-4">
                <div className="space-y-4">
                  {Object.entries(merchants).map(([merchant, amount]) => (
                    <div key={merchant} className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                      <span className="font-medium">{merchant}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showNetSuiteDialog} onOpenChange={setShowNetSuiteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to NetSuite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee-email">Employee Email</Label>
              <Input
                id="employee-email"
                type="email"
                placeholder="Enter employee email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNetSuiteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNetSuiteSubmit}
                disabled={!employeeEmail || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 