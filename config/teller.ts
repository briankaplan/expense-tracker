import dotenv from 'dotenv';

dotenv.config();

export const TellerConfig = {
  apiKey: process.env.TELLER_API_KEY || '',
  environment: process.env.TELLER_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.TELLER_BASE_URL || 'https://api.teller.io',
  webhookSecret: process.env.TELLER_WEBHOOK_SECRET || '',
  options: {
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Expense-Tracker/1.0.0'
    }
  }
};

export const validateConfig = () => {
  if (!TellerConfig.apiKey) {
    throw new Error('TELLER_API_KEY is required');
  }
  if (!TellerConfig.webhookSecret) {
    throw new Error('TELLER_WEBHOOK_SECRET is required');
  }
};

export default TellerConfig; 