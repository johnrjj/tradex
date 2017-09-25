import * as GTT from 'gdax-trading-toolkit';
import { isSameMinute, startOfMinute } from 'date-fns';
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
      const config: LiveBookConfig = {
        product,
        logger,
      };
      const book = new LiveOrderbook(config);
      const historyBook = new OrderbookHistory(config);

      feed.on('error', err => {
        logger.log('error', 'feed error, gonna try again to reconnect', err);
        feed.reconnect(1);
      });

      feed.pipe(book);
      feed.pipe(historyBook);

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
