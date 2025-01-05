'use client';

import { createContext, useContext, useState } from 'react';
import type { Report, ReportFilters, ReportSort, ReceiptMatch } from '@/types/reports';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { generateReportPDF } from '@/lib/pdf';
import { NetSuiteService } from '@/lib/netsuite';
import { toast } from '@/components/ui/use-toast';

interface ReportsContextType {
  reports: Report[];
  activeReport?: Report;
  filters: ReportFilters;
  sort: ReportSort;
  suggestedMatches: ReceiptMatch[];
  setFilters: (filters: ReportFilters) => void;
  setSort: (sort: ReportSort) => void;
  closeReport: (id: string) => Promise<void>;
  reopenReport: (id: string) => Promise<void>;
  matchReceipt: (expenseId: string, receiptId: string) => Promise<void>;
  unmatchReceipt: (expenseId: string) => Promise<void>;
  updateComment: (expenseId: string, comment: string) => Promise<void>;
  batchUploadReceipts: (files: File[]) => Promise<void>;
  exportReportCSV: (reportId: string) => Promise<void>;
  exportReportPDF: (reportId: string) => Promise<void>;
  exportReportReceipts: (reportId: string) => Promise<void>;
  submitToNetSuite: (reportId: string, email: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Initial mock data
const initialReports: Report[] = [
  {
    id: '1',
    type: 'business',
    status: 'open',
    totalAmount: 1250.75,
    expenseCount: 5,
    missingReceipts: 1,
    missingComments: 2,
    dateCreated: '2024-01-15',
    expenses: [],
    categories: {
      'Office Supplies': 450.25,
      'Travel': 800.50
    },
    merchants: {
      'Office Depot': 450.25,
      'Delta Airlines': 800.50
    }
  },
  {
    id: '2',
    type: 'business',
    status: 'closed',
    totalAmount: 2500.00,
    expenseCount: 8,
    missingReceipts: 0,
    missingComments: 0,
    dateCreated: '2024-01-01',
    dateClosed: '2024-01-14',
    expenses: [],
    categories: {
      'Travel': 1500.00,
      'Meals': 1000.00
    },
    merchants: {
      'United Airlines': 1500.00,
      'Various Restaurants': 1000.00
    }
  },
  {
    id: '3',
    type: 'personal',
    status: 'open',
    totalAmount: 750.25,
    expenseCount: 3,
    missingReceipts: 1,
    missingComments: 0,
    dateCreated: '2024-01-20',
    expenses: [],
    categories: {
      'Groceries': 250.25,
      'Entertainment': 500.00
    },
    merchants: {
      'Whole Foods': 250.25,
      'AMC Theaters': 500.00
    }
  }
];

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [activeReport, setActiveReport] = useState<Report>();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sort, setSort] = useState<ReportSort>({ field: 'date', direction: 'desc' });
  const [suggestedMatches, setSuggestedMatches] = useState<ReceiptMatch[]>([]);

  // Initialize NetSuite service
  const netsuiteService = new NetSuiteService({
    accountId: process.env.NEXT_PUBLIC_NETSUITE_ACCOUNT_ID || '',
    consumerKey: process.env.NEXT_PUBLIC_NETSUITE_CONSUMER_KEY || '',
    consumerSecret: process.env.NEXT_PUBLIC_NETSUITE_CONSUMER_SECRET || '',
    tokenId: process.env.NEXT_PUBLIC_NETSUITE_TOKEN_ID || '',
    tokenSecret: process.env.NEXT_PUBLIC_NETSUITE_TOKEN_SECRET || '',
    baseUrl: process.env.NEXT_PUBLIC_NETSUITE_BASE_URL || '',
  });

  const closeReport = async (id: string) => {
    setReports(prev => prev.map(report => {
      if (report.id === id) {
        return {
          ...report,
          status: 'closed',
          dateClosed: new Date().toISOString()
        };
      }
      return report;
    }));
  };

  const reopenReport = async (id: string) => {
    setReports(prev => prev.map(report => {
      if (report.id === id) {
        const { dateClosed, ...rest } = report;
        return {
          ...rest,
          status: 'open'
        };
      }
      return report;
    }));
  };

  const matchReceipt = async (expenseId: string, receiptId: string) => {
    // TODO: Implement receipt matching
    console.log('Matching receipt:', { expenseId, receiptId });
  };

  const unmatchReceipt = async (expenseId: string) => {
    // TODO: Implement receipt unmatching
    console.log('Unmatching receipt for expense:', expenseId);
  };

  const updateComment = async (expenseId: string, comment: string) => {
    // TODO: Implement comment updating
    console.log('Updating comment:', { expenseId, comment });
  };

  const batchUploadReceipts = async (files: File[]) => {
    // TODO: Implement receipt uploading
    console.log('Uploading receipts:', files);
  };

  const exportReportCSV = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Format data for NetSuite
    const csvData = report.expenses.map(expense => ({
      Date: new Date(expense.date).toISOString().split('T')[0],
      Amount: expense.amount.toFixed(2),
      Merchant: expense.merchant,
      Category: expense.category,
      Description: expense.description || '',
      Type: expense.type,
      PaymentMethod: expense.paymentMethod || '',
      ReceiptStatus: expense.matchedReceiptId ? 'Attached' : 'Missing',
      TransactionId: expense.id,
      ReportId: reportId,
      ReportDate: new Date(report.dateCreated).toISOString().split('T')[0]
    }));

    // Convert to CSV
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `expense_report_${reportId}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportReportPDF = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      const pdfBlob = await generateReportPDF(report);
      saveAs(pdfBlob, `expense_report_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  };

  const exportReportReceipts = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const zip = new JSZip();
    const receiptsFolder = zip.folder(`report_${reportId}_receipts`);

    // Create a manifest file
    let manifest = 'Receipt Index\n\n';
    manifest += 'Filename,Date,Merchant,Amount,ExpenseId\n';

    // Add each receipt to the zip
    for (let i = 0; i < report.expenses.length; i++) {
      const expense = report.expenses[i];
      if (expense.matchedReceiptId) {
        const receiptData = await fetchReceiptData(expense.matchedReceiptId);
        if (receiptData) {
          const filename = `${reportId}_${i + 1}_${expense.date.split('T')[0]}_${
            expense.merchant.replace(/[^a-z0-9]/gi, '_')
          }_${expense.amount}.${receiptData.type}`;
          
          receiptsFolder?.file(filename, receiptData.blob);
          manifest += `${filename},${expense.date},${expense.merchant},${expense.amount},${expense.id}\n`;
        }
      }
    }

    // Add manifest to zip
    receiptsFolder?.file('_MANIFEST.csv', manifest);

    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `report_${reportId}_receipts.zip`);
  };

  // Helper function to fetch receipt data (mock implementation)
  const fetchReceiptData = async (receiptId: string) => {
    // TODO: Implement actual receipt fetching
    // This is a mock implementation
    return {
      type: 'jpg',
      blob: new Blob(['mock receipt data'], { type: 'image/jpeg' })
    };
  };

  const submitToNetSuite = async (reportId: string, email: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      toast({
        title: "Error",
        description: "Report not found",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get employee ID from email
      const employeeId = await netsuiteService.getEmployeeId(email);

      // Submit report to NetSuite
      const netsuiteReportId = await netsuiteService.submitExpenseReport(report, employeeId);

      // Update report status
      setReports(prev => prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'closed',
            dateClosed: new Date().toISOString(),
            netsuiteId: netsuiteReportId
          };
        }
        return r;
      }));

      toast({
        title: "Success",
        description: "Report submitted to NetSuite successfully",
      });
    } catch (error) {
      console.error('Failed to submit to NetSuite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit to NetSuite",
        variant: "destructive"
      });
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        activeReport,
        filters,
        sort,
        suggestedMatches,
        setFilters,
        setSort,
        closeReport,
        reopenReport,
        matchReceipt,
        unmatchReceipt,
        updateComment,
        batchUploadReceipts,
        exportReportCSV,
        exportReportPDF,
        exportReportReceipts,
        submitToNetSuite
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
} 