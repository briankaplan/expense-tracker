import { Report } from '@/types/reports';
import { NetSuiteAuth, NetSuiteCredentials } from './netsuite-auth';
import { formatCurrency } from '@/lib/utils';

interface NetSuiteConfig {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
  baseUrl: string;
}

interface NetSuiteEmployee {
  internalId: string;
  email: string;
  subsidiary: {
    internalId: string;
    name: string;
  };
  department?: {
    internalId: string;
    name: string;
  };
  location?: {
    internalId: string;
    name: string;
  };
  supervisor?: {
    internalId: string;
    name: string;
  };
}

interface NetSuiteExpense {
  tranId: string;
  employee: {
    internalId: string;
  };
  subsidiary: {
    internalId: string;
  };
  department?: {
    internalId: string;
  };
  location?: {
    internalId: string;
  };
  tranDate: string;
  amount: number;
  memo: string;
  category: {
    internalId: string;
  };
  currency: {
    internalId: string;
  };
  expenseAccount: {
    internalId: string;
  };
  approver?: {
    internalId: string;
  };
}

export class NetSuiteService {
  private auth: NetSuiteAuth;
  private config: NetSuiteCredentials;
  private categoryMap: Record<string, string> = {
    'Travel': '138',
    'Meals': '139',
    'Office Supplies': '140',
  };

  constructor(config: NetSuiteCredentials) {
    this.config = config;
    this.auth = new NetSuiteAuth(config);
  }

  private async makeRequest(endpoint: string, method: string, data?: any, contentType = 'application/json') {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': this.auth.generateAuthHeader(method, url, data),
    };

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? (contentType === 'application/json' ? JSON.stringify(data) : data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NetSuite API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('NetSuite request failed:', error);
      throw error;
    }
  }

  async getEmployeeDetails(email: string): Promise<NetSuiteEmployee> {
    try {
      // First, get basic employee info including subsidiary
      const response = await this.makeRequest(
        `/rest/v1/record/employee?q=email IS ${email}&expandSubResources=true`,
        'GET'
      );
      
      if (!response.items || response.items.length === 0) {
        throw new Error('Employee not found');
      }

      const employee = response.items[0];

      // Get additional details like department preferences and approver
      const details = await this.makeRequest(
        `/rest/v1/record/employee/${employee.internalId}?expandSubResources=true`,
        'GET'
      );

      return {
        internalId: employee.internalId,
        email: employee.email,
        subsidiary: {
          internalId: details.subsidiary.internalId,
          name: details.subsidiary.name
        },
        department: details.department ? {
          internalId: details.department.internalId,
          name: details.department.name
        } : undefined,
        location: details.location ? {
          internalId: details.location.internalId,
          name: details.location.name
        } : undefined,
        supervisor: details.supervisor ? {
          internalId: details.supervisor.internalId,
          name: details.supervisor.name
        } : undefined
      };
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      throw error;
    }
  }

  async submitExpenseReport(report: Report, email: string): Promise<string> {
    try {
      // Get complete employee details including subsidiary and department
      const employeeDetails = await this.getEmployeeDetails(email);

      // Create expense report record with proper organizational context
      const expenseReport = await this.makeRequest('/rest/v1/record/expensereport', 'POST', {
        entity: { internalId: employeeDetails.internalId },
        subsidiary: { internalId: employeeDetails.subsidiary.internalId },
        department: employeeDetails.department,
        location: employeeDetails.location,
        approver: employeeDetails.supervisor,
        tranDate: report.dateCreated,
        memo: `Expense Report #${report.id}`,
        expenses: await Promise.all(report.expenses.map(async expense => {
          const expenseData: any = {
            tranId: expense.id,
            employee: {
              internalId: employeeDetails.internalId
            },
            subsidiary: {
              internalId: employeeDetails.subsidiary.internalId
            },
            department: employeeDetails.department,
            location: employeeDetails.location,
            tranDate: expense.date,
            amount: expense.amount,
            memo: expense.description || '',
            category: {
              internalId: this.categoryMap[expense.category] || ''
            },
            currency: {
              internalId: '1' // USD
            },
            expenseAccount: {
              internalId: '54' // Example expense account
            }
          };

          // If there's a receipt, upload it first and attach the file ID
          if (expense.matchedReceiptId) {
            const fileId = await this.uploadReceipt(expense.matchedReceiptId, expense, employeeDetails);
            if (fileId) {
              expenseData.receipt = {
                internalId: fileId
              };
            }
          }

          return expenseData;
        }))
      });

      return expenseReport.id;
    } catch (error) {
      console.error('Failed to submit expense report to NetSuite:', error);
      throw error;
    }
  }

  private async uploadReceipt(
    receiptId: string, 
    expense: any, 
    employeeDetails: NetSuiteEmployee
  ): Promise<string> {
    try {
      const receiptFile = await this.fetchReceiptFile(receiptId);
      if (!receiptFile) {
        throw new Error('Receipt file not found');
      }

      // Include organizational context in receipt filename and metadata
      const filename = `${employeeDetails.subsidiary.name}_${expense.id}_${
        new Date(expense.date).toISOString().split('T')[0]
      }_${expense.merchant.replace(/[^a-z0-9]/gi, '_')}.${receiptFile.type}`;

      const formData = new FormData();
      formData.append('file', receiptFile.blob, filename);
      formData.append('name', `Receipt - ${expense.merchant} - ${formatCurrency(expense.amount)}`);
      formData.append('description', [
        `Receipt for expense on ${new Date(expense.date).toLocaleDateString()}`,
        `Subsidiary: ${employeeDetails.subsidiary.name}`,
        employeeDetails.department?.name && `Department: ${employeeDetails.department.name}`,
        employeeDetails.location?.name && `Location: ${employeeDetails.location.name}`,
        `Employee: ${employeeDetails.email}`
      ].filter(Boolean).join('\n'));
      formData.append('folder', employeeDetails.subsidiary.internalId); // Store in subsidiary-specific folder

      const response = await this.makeRequest('/rest/v1/file', 'POST', formData, 'multipart/form-data');
      return response.id;
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      return '';
    }
  }

  private async fetchReceiptFile(receiptId: string): Promise<{ blob: Blob; type: string } | null> {
    try {
      const response = await fetch(`/api/receipts/${receiptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch receipt');
      }

      const blob = await response.blob();
      const type = blob.type.split('/')[1] || 'jpg';

      return { blob, type };
    } catch (error) {
      console.error('Failed to fetch receipt file:', error);
      return null;
    }
  }
} 