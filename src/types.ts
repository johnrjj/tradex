interface Candle {
  timestamp: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  openTradeTimestamp?: string;
  closingTradeTimestamp?: string;
}

export { Candle };
