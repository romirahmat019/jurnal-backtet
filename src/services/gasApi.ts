import { Trade } from '../types/trade';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export class GasApiService {
  private url: string;

  constructor(gasUrl: string = '') {
    this.url = gasUrl;
  }

  async ping(): Promise<ApiResponse<{ status: string }>> {
    return GasApiService.ping(this.url);
  }

  async fetchTrades(): Promise<ApiResponse<Trade[]>> {
    return GasApiService.fetchTrades(this.url);
  }

  async createTrade(trade: Trade): Promise<ApiResponse<{ id: string }>> {
    return GasApiService.createTrade(this.url, trade);
  }

  async deleteTrade(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return GasApiService.deleteTrade(this.url, id);
  }

  async uploadScreenshot(
    base64Data: string,
    fileName: string,
    tradeId: string
  ): Promise<ApiResponse<{ fileId: string; fileName: string; driveUrl: string; downloadUrl: string }>> {
    return GasApiService.uploadScreenshot(this.url, base64Data, fileName, tradeId);
  }

  /**
   * Tests connection to the Google Apps Script Web App URL
   */
  static async ping(gasUrl: string): Promise<ApiResponse<{ status: string }>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, data: null, message: 'Google Apps Script URL is empty.' };
    }

    try {
      const url = new URL(gasUrl);
      url.searchParams.set('action', 'ping');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        data: null,
        message: `Koneksi Google Apps Script gagal: ${message}`,
      };
    }
  }

  /**
   * Fetches all trades from Google Sheets via GAS
   */
  static async fetchTrades(gasUrl: string): Promise<ApiResponse<Trade[]>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, data: null, message: 'GAS URL belum dikonfigurasi.' };
    }

    try {
      const url = new URL(gasUrl);
      url.searchParams.set('action', 'getTrades');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        data: null,
        message: `Unable to load trading data: ${message}`,
      };
    }
  }

  /**
   * Syncs / creates a new trade to Google Sheets
   */
  static async createTrade(gasUrl: string, trade: Trade): Promise<ApiResponse<{ id: string }>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, data: null, message: 'Google Apps Script URL is empty.' };
    }

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS handles text/plain without triggering complex CORS preflight
        body: JSON.stringify({
          action: 'createTrade',
          trade,
        }),
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        data: null,
        message: `Failed to save trade to Google Sheets: ${message}`,
      };
    }
  }

  /**
   * Deletes a trade from Google Sheets via GAS
   */
  static async deleteTrade(gasUrl: string, id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, data: null, message: 'GAS URL not configured.' };
    }

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteTrade',
          id,
        }),
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        data: null,
        message: `Failed to delete trade from Google Sheets: ${message}`,
      };
    }
  }

  /**
   * Uploads screenshot to Google Drive via GAS
   */
  static async uploadScreenshot(
    gasUrl: string,
    base64Data: string,
    fileName: string,
    tradeId: string
  ): Promise<ApiResponse<{ fileId: string; fileName: string; driveUrl: string; downloadUrl: string }>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, data: null, message: 'Google Apps Script URL not configured.' };
    }

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'uploadScreenshot',
          base64Data,
          fileName,
          tradeId,
        }),
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        data: null,
        message: `Screenshot upload failed: ${message}`,
      };
    }
  }
}
