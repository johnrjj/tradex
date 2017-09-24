import * as GTT from 'gdax-trading-toolkit';
import { GDAXFeed } from 'gdax-trading-toolkit/build/src/exchanges';
import { OrderbookMessage } from 'gdax-trading-toolkit/build/src/core';

const logger = GTT.utils.ConsoleLoggerFactory();
const products: string[] = ['BTC-USD'];
const tallies: any = {};
products.forEach((product: string) => {
  tallies[product] = {};
});

let count = 0;

GTT.Factories.GDAX
  .FeedFactory(logger, products)
  .then((feed: GDAXFeed) => {
    feed.on('data', (msg: OrderbookMessage) => {
      // console.log(msg.type);
      if (msg.type === 'trade') {
        console.log(msg);
      }
      count++;
      if (!(msg as any).productId) {
        tallies.other += 1;
      } else {
        const tally = tallies[msg.productId];
        if (!tally[msg.type]) {
          tally[msg.type] = 0;
        }
        tally[msg.type] += 1;
      }
      if (count % 1000 === 0) {
        printTallies();
      }
    });
  })
  .catch((err: Error) => {
    logger.log('error', err.message);
    process.exit(1);
  });

function printTallies() {
  console.log(`${count} messages received`);
  for (const p in tallies) {
    const types = Object.keys(tallies[p]).sort();
    const tally: string = types.map(t => `${t}: ${tallies[p][t]}`).join('\t');
    console.log(`${p}: ${tally}`);
  }
}
