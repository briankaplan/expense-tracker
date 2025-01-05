import crypto from 'crypto';

export interface NetSuiteCredentials {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
  baseUrl: string;
}

export class NetSuiteAuth {
  private credentials: NetSuiteCredentials;

  constructor(credentials: NetSuiteCredentials) {
    this.credentials = credentials;
  }

  generateAuthHeader(method: string, url: string, data?: any): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = this.generateNonce();
    const signature = this.generateSignature(method, url, timestamp, nonce, data);

    return `OAuth realm="${this.credentials.accountId}",
      oauth_consumer_key="${this.credentials.consumerKey}",
      oauth_token="${this.credentials.tokenId}",
      oauth_signature_method="HMAC-SHA256",
      oauth_timestamp="${timestamp}",
      oauth_nonce="${nonce}",
      oauth_version="1.0",
      oauth_signature="${signature}"`;
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  private generateSignature(
    method: string,
    url: string,
    timestamp: string,
    nonce: string,
    data?: any
  ): string {
    // Create the parameter string
    const params = new Map<string, string>([
      ['oauth_consumer_key', this.credentials.consumerKey],
      ['oauth_token', this.credentials.tokenId],
      ['oauth_signature_method', 'HMAC-SHA256'],
      ['oauth_timestamp', timestamp],
      ['oauth_nonce', nonce],
      ['oauth_version', '1.0'],
    ]);

    // Add any query parameters from the URL
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    // Add body parameters if it's a POST/PUT request with JSON data
    if (data && (method === 'POST' || method === 'PUT')) {
      const flattenedData = this.flattenObject(data);
      Object.entries(flattenedData).forEach(([key, value]) => {
        params.set(key, value.toString());
      });
    }

    // Sort parameters alphabetically
    const sortedParams = new Map([...params].sort());

    // Create the parameter string
    const paramString = Array.from(sortedParams)
      .map(([key, value]) => `${this.encodeURIComponent(key)}=${this.encodeURIComponent(value)}`)
      .join('&');

    // Create the signature base string
    const signatureBase = [
      method.toUpperCase(),
      this.encodeURIComponent(url.split('?')[0]), // Base URL without query params
      this.encodeURIComponent(paramString),
    ].join('&');

    // Create the signing key
    const signingKey = `${this.encodeURIComponent(this.credentials.consumerSecret)}&${this.encodeURIComponent(
      this.credentials.tokenSecret
    )}`;

    // Generate the signature
    return crypto
      .createHmac('sha256', signingKey)
      .update(signatureBase)
      .digest('base64');
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      const propName = prefix ? `${prefix}[${key}]` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(acc, this.flattenObject(obj[key], propName));
      } else {
        acc[propName] = obj[key];
      }
      return acc;
    }, {});
  }

  private encodeURIComponent(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
      .replace(/%20/g, '+');
  }
} 