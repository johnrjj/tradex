import { isSameMinute, startOfMinute } from 'date-fns';
import * as GTT from 'gdax-trading-toolkit';
import { GDAXFeed } from 'gdax-trading-toolkit/build/src/exchanges';
import {
  LiveBookConfig,
  LiveOrderbook,
  SkippedMessageEvent,
  TradeMessage,
} from 'gdax-trading-toolkit/build/src/core';
import { Ticker } from 'gdax-trading-toolkit/build/src/exchanges/PublicExchangeAPI';
import { OrderbookHistory } from './orderbook-history';

const product = 'BTC-USD';
const logger = GTT.utils.ConsoleLoggerFactory({ level: 'debug' });

let currentMinute = startOfMinute(new Date());

GTT.Factories.GDAX.FeedFactory(logger, [product]).then((feed: GDAXFeed) => {
  // Configure the live book object
  const config: LiveBookConfig = {
    product: product,
    logger: logger,
  };
  const book = new LiveOrderbook(config);
  const historyBook = new OrderbookHistory(config);

  book.on('LiveOrderbook.trade', (trade: TradeMessage) => {
    // console.log(trade.time, trade.type);
    try {
      historyBook.addTradeMessageToHistory(trade);
    } catch (e) {
      logger.log('error', `Error adding to history book`, e);
    }
  });

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

  // pipe it up
  feed.pipe(book);

  feed.on('error', err => {
    console.log('wahh', err);
  });
});
