import { NetSuiteCredentials } from '@/lib/netsuite-auth';

if (!process.env.NETSUITE_ACCOUNT_ID) {
  throw new Error('NetSuite configuration is missing. Please set the required environment variables.');
}

export const netsuiteConfig: NetSuiteCredentials = {
  accountId: process.env.NETSUITE_ACCOUNT_ID,
  consumerKey: process.env.NETSUITE_CONSUMER_KEY!,
  consumerSecret: process.env.NETSUITE_CONSUMER_SECRET!,
  tokenId: process.env.NETSUITE_TOKEN_ID!,
  tokenSecret: process.env.NETSUITE_TOKEN_SECRET!,
  baseUrl: process.env.NETSUITE_BASE_URL || `https://rest.netsuite.com/app/site/hosting/restlet.nl`,
}; 