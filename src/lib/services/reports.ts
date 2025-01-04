import { v4 as uuidv4 } from 'uuid';

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

export async function generateReport(type: 'business' | 'personal'): Promise<Report> {
  // In a real app, this would fetch data from your backend
  // For now, we'll return mock data
  return {
    id: uuidv4(),
    type,
    status: 'open',
    totalAmount: Math.random() * 10000,
    expenseCount: Math.floor(Math.random() * 20) + 1,
    missingReceipts: Math.floor(Math.random() * 5),
    missingComments: Math.floor(Math.random() * 5),
    dateCreated: new Date().toISOString(),
    categories: {
      'Office Supplies': Math.random() * 1000,
      'Travel': Math.random() * 2000,
      'Meals': Math.random() * 500,
      'Software': Math.random() * 1500,
    },
    merchants: {
      'Amazon': Math.random() * 2000,
      'Uber': Math.random() * 500,
      'Staples': Math.random() * 300,
      'WeWork': Math.random() * 1000,
      'Adobe': Math.random() * 500,
    },
  };
}

export async function exportReport(reportId: string): Promise<void> {
  // In a real app, this would generate a PDF or Excel file
  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // You could trigger a file download here
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Report data'));
  element.setAttribute('download', `report-${reportId}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export async function filterReports(
  reports: Report[],
  filters: {
    type?: 'business' | 'personal';
    status?: 'open' | 'closed';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<Report[]> {
  return reports.filter(report => {
    if (filters.type && report.type !== filters.type) return false;
    if (filters.status && report.status !== filters.status) return false;
    
    if (filters.startDate) {
      const reportDate = new Date(report.dateCreated);
      if (reportDate < filters.startDate) return false;
    }
    
    if (filters.endDate) {
      const reportDate = new Date(report.dateCreated);
      if (reportDate > filters.endDate) return false;
    }
    
    if (filters.minAmount && report.totalAmount < filters.minAmount) return false;
    if (filters.maxAmount && report.totalAmount > filters.maxAmount) return false;
    
    return true;
  });
} 