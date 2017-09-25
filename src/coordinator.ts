import { isSameMinute, startOfMinute } from 'date-fns';
import * as GTT from 'gdax-trading-toolkit';
import { GDAXFeed, ExchangeFeed } from 'gdax-trading-toolkit/build/src/exchanges';
import {
  LiveBookConfig,
  LiveOrderbook,
  SkippedMessageEvent,
  TradeMessage,
} from 'gdax-trading-toolkit/build/src/core';
import { Ticker } from 'gdax-trading-toolkit/build/src/exchanges/PublicExchangeAPI';
import { Logger } from 'gdax-trading-toolkit/build/src/utils';
import { OrderbookHistory, getNPreviousCandles } from './orderbook-history';
import { Candle } from './candle';

interface FullFeed {
  book: LiveOrderbook;
  historyBook: OrderbookHistory;
  feed: ExchangeFeed;
}

class Coordinator {
  candleMetadata: WeakMap<Candle, any> = new WeakMap();
  readonly algorithms: Array<any>;
  readonly book: LiveOrderbook;
  readonly historyBook: OrderbookHistory;
  readonly feedRef: ExchangeFeed;

  constructor({ book, feed, historyBook }: FullFeed) {
    this.book = book;
    this.feedRef = feed;
    this.historyBook = historyBook;
    this.historyBook.on('OrderbookHistory.update', (c: Candle) => {
      const meta = this.candleMetadata.get(c);
      const candles: Array<Candle> = getNPreviousCandles(c);
    });
  }
}

export { FullFeed, Coordinator };
