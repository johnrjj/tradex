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
import { Big, big, BigJS, Biglike, ONE, ZERO } from './types';

interface FullFeed {
  book: LiveOrderbook;
  historyBook: OrderbookHistory;
  feed: ExchangeFeed;
}

interface AlgorithmCache {
  avgGain: BigJS;
  avgLoss: BigJS;
  rsi: BigJS;
}

class Coordinator {
  candleMetadata: WeakMap<Candle, AlgorithmCache> = new WeakMap();
  readonly algorithms: AlgorithmCache;
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
      const foo = Big(candles[candles.length - 1] && candles[candles.length - 1].current);
      console.log(foo);
    });
  }
}

export { FullFeed, AlgorithmCache, Coordinator };
