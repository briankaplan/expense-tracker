import { TELLER_APP_ID, TELLER_ENV } from '@/lib/config';

export interface TellerConnectOptions {
  applicationId: string;
  environment: string;
  onSuccess: (enrollment: any) => void;
  onExit: () => void;
  onError: (error: Error) => void;
}

export class TellerConnect {
  private options: TellerConnectOptions;
  private static instance: TellerConnect | null = null;

  constructor(options: TellerConnectOptions) {
    this.options = options;
  }

  static setup(options: TellerConnectOptions): TellerConnect {
    if (!TellerConnect.instance) {
      TellerConnect.instance = new TellerConnect(options);
    }
    return TellerConnect.instance;
  }

  open(): void {
    // In a real implementation, this would initialize and open the Teller Connect UI
    // For now, we'll simulate it with a success callback
    setTimeout(() => {
      this.options.onSuccess({
        id: 'test-enrollment',
        institution: {
          name: 'Test Bank',
        },
        accounts: [],
      });
    }, 1000);
  }
}

export async function initializeTeller(options: TellerConnectOptions): Promise<TellerConnect> {
  return new TellerConnect(options);
} 