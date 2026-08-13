export interface RawMonobankResponse {
  id: string;
  sendId: string;
  title: string;
  description: string;
  currencyCode: number;
  balance: number; // in kopecks
  goal: number;    // in kopecks
  ownerName: string;
  updatedAt: string;
}

export interface ParsedMonobankData {
  jarUrl: string;
  title: string;
  description: string;
  balanceUah: number;
  goalUah: number;
  currency: string;
  percentage: number;
  remainingUah: number;
  logoUrl?: string;
}

export interface DonationItem {
  id: string;
  name: string;
  amount: number;
  time: string;
  comment?: string;
}

export interface MonobankApiResponse {
  success: boolean;
  apiEndpoint: string;
  apiStatusMsg?: string;
  rawMonobankResponse: RawMonobankResponse;
  parsed: ParsedMonobankData;
  donations?: DonationItem[];
}
