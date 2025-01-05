import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatCurrency } from './utils';
import type { Report } from '@/types/reports';

// Initialize pdfmake with fonts
async function initPdfMake() {
  if (typeof window !== 'undefined') {
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }
}

export async function generateReportPDF(report: Report) {
  await initPdfMake();

  const docDefinition: TDocumentDefinitions = {
    content: [
      // Header
      {
        text: `Expense Report #${report.id}`,
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        text: [
          { text: 'Type: ', bold: true },
          report.type.charAt(0).toUpperCase() + report.type.slice(1),
          '\n',
          { text: 'Status: ', bold: true },
          report.status.charAt(0).toUpperCase() + report.status.slice(1),
          '\n',
          { text: 'Created: ', bold: true },
          new Date(report.dateCreated).toLocaleDateString(),
          report.dateClosed ? [
            '\n',
            { text: 'Closed: ', bold: true },
            new Date(report.dateClosed).toLocaleDateString()
          ] : ''
        ]
      },
      
      // Summary
      {
        text: 'Summary',
        style: 'subheader',
        margin: [0, 20, 0, 10]
      },
      {
        columns: [
          [
            { text: 'Total Amount:', bold: true },
            { text: 'Total Expenses:', bold: true },
            { text: 'Missing Receipts:', bold: true },
          ],
          [
            formatCurrency(report.totalAmount),
            report.expenseCount.toString(),
            report.missingReceipts.toString(),
          ]
        ],
        columnGap: 10
      },

      // Categories Breakdown
      {
        text: 'Categories',
        style: 'subheader',
        margin: [0, 20, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Category', 'Amount'],
            ...Object.entries(report.categories).map(([category, amount]) => [
              category,
              formatCurrency(amount)
            ])
          ]
        }
      },

      // Merchants Breakdown
      {
        text: 'Merchants',
        style: 'subheader',
        margin: [0, 20, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Merchant', 'Amount'],
            ...Object.entries(report.merchants)
              .sort(([, a], [, b]) => b - a)
              .map(([merchant, amount]) => [
                merchant,
                formatCurrency(amount)
              ])
          ]
        }
      },

      // Detailed Expenses
      {
        text: 'Expenses',
        style: 'subheader',
        margin: [0, 20, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            ['Date', 'Description', 'Merchant', 'Category', 'Amount'],
            ...report.expenses.map(expense => [
              new Date(expense.date).toLocaleDateString(),
              expense.description || '',
              expense.merchant,
              expense.category,
              formatCurrency(expense.amount)
            ])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true
      },
      subheader: {
        fontSize: 16,
        bold: true,
        color: '#666666'
      }
    },
    defaultStyle: {
      fontSize: 10
    },
    footer: function(currentPage: number, pageCount: number) {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        margin: [0, 10, 0, 0]
      };
    }
  };

  return new Promise<Blob>((resolve) => {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      resolve(blob);
    });
  });
} 