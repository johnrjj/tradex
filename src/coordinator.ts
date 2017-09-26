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
import { RsiCalculator } from './algorithms/rsi';
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
  rsiCalculator: RsiCalculator;

  constructor({ book, feed, historyBook }: FullFeed, logger?: Logger) {
    this.book = book;
    this.feedRef = feed;
    this.historyBook = historyBook;
    this.rsiCalculator = new RsiCalculator(logger);
    this.historyBook.on('OrderbookHistory.update', (c: Candle) => {
      logger.log('debug', 'candle update (not closed)')
      this.rsiCalculator.calculate(c, false);
    });
    this.historyBook.on('OrderbookHistory.candleClose', (c: Candle) => {
      logger.log('debug', 'candle closed')
      const rsi = this.rsiCalculator.calculate(c, true);
      logger.log('info', `${c.timestamp} RSI:\t${rsi}`);
    });
  }
}

export { FullFeed, AlgorithmCache, Coordinator };
