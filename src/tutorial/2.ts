import { isSameMinute, startOfMinute } from 'date-fns';

import * as GTT from 'gdax-trading-toolkit';
import { GDAXFeed } from 'gdax-trading-toolkit/build/src/exchanges';
import {
  LiveBookConfig,
  LiveOrderbook,
  SkippedMessageEvent,
  TradeMessage,
} from 'gdax-trading-toolkit/build/src/core';
// import { Ticker } from "gdax-trading-toolkit/build/src/exchanges/PublicExchangeAPI";
// import { CumulativePriceLevel } from "gdax-trading-toolkit/build/src/lib";

const product = 'BTC-USD';
const logger = GTT.utils.ConsoleLoggerFactory({ level: 'debug' });
// const printOrderbook = GTT.utils.printOrderbook;
// const printTicker = GTT.utils.printTicker;

let i = 0;

let currentMinute = startOfMinute(new Date());
// let minuteHistory = new Map();

GTT.Factories.GDAX.FeedFactory(logger, [product]).then((feed: GDAXFeed) => {
  // Configure the live book object
  const config: LiveBookConfig = {
    product: product,
    logger: logger,
  };
  const book = new LiveOrderbook(config);
  book.on('LiveOrderbook.snapshot', (x: any) => {
    logger.log('info', 'Snapshot received by LiveOrderbook Demo');
    console.log(x);
    // setInterval(() => {
    //     // console.log(printOrderbook(book, 10));
    //     // printOrderbookStats(book);
    //     // logger.log('info', `Cumulative trade volume: ${tradeVolume.toFixed(4)}`);
    // }, 5000);
  });
  // book.on('LiveOrderbook.ticker', (ticker: Ticker) => {
  //     console.log(printTicker(ticker));
  // });
  book.on('LiveOrderbook.trade', (trade: TradeMessage) => {
    // console.log(trade.time, trade.type);
    if (isSameMinute(trade.time, currentMinute)) {
      console.log('yay it worked');
    } else {
      // old minute probably
      console.log('nope');
    }
    console.log(++i);
    // tradeVolume += +(trade.size);
    // isSameMinute, startOfMinute
  });
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
});
