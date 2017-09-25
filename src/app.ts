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
import { Coordinator, FullFeed } from './coordinator';

import { OrderbookHistory } from './orderbook-history';

const products = ['BTC-USD'];
const logger = GTT.utils.ConsoleLoggerFactory({ level: 'debug' });

const startStreams = (logger: Logger, products: Array<string>) =>
  GTT.Factories.GDAX.FeedFactory(logger, products).then((feed: GDAXFeed): Array<FullFeed> => {
    const feeds: Array<FullFeed> = products.map(product => {
      // Configure the live book object
      const config: LiveBookConfig = {
        product: product,
        logger: logger,
      };
      const book = new LiveOrderbook(config);
      const historyBook = new OrderbookHistory(config);

      // book.on('LiveOrderbook.trade', (trade: TradeMessage) => {});
      // book.on('LiveOrderbook.ticker', (ticker: Ticker) => {});

      book.on('LiveOrderbook.skippedMessage', (details: SkippedMessageEvent) => {
        // On GDAX, this event should never be emitted, but we put it here for completeness
        console.log('SKIPPED MESSAGE', details);
        console.log('Reconnecting to feed');
        feed.reconnect(0);
      });
      book.on('end', () => {
        console.log('Orderbook closed');
      });
      book.on('error', err => {
        console.log('Livebook errored: ', err);
        feed.pipe(book);
      });

      feed.pipe(book);
      feed.pipe(historyBook);

      feed.on('error', err => {
        console.log('wahh', err);
      });

      return {
        feed,
        book,
        historyBook,
      };
    });
    return feeds;
  });

startStreams(logger, products).then(streams => {
  const coordinators = streams.map(s => new Coordinator(s));
});
