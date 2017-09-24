// this.logger = config.logger;
// this.product = config.product;
import {
  startOfMinute,
  isSameMinute,
  isAfter,
  isBefore,
  differenceInMinutes,
} from 'date-fns';
import { TradeMessage } from 'gdax-trading-toolkit/build/src/core';
import { Logger } from 'gdax-trading-toolkit/build/src/utils';
import { max, min, sum } from 'lodash';
import { Candle } from './types';

class OrderbookHistory {
  private readonly logger: Logger;
  private readonly product: string;
  private readonly baseCurrency: string;
  private readonly quoteCurrency: string;
  private readonly currentMinute: Date;
  private map = new Map<string, Candle>();

  constructor({ logger, product }: { logger?: Logger; product: string }) {
    this.logger = logger;
    this.product = product;
    [this.baseCurrency, this.quoteCurrency] = this.product.split('-');
    this.currentMinute = startOfMinute(new Date());
  }

  public addTradeMessageToHistory(t: TradeMessage) {
    if (isSameMinute(t.time, this.currentMinute)) {
      this.logger.log('debug', 'same minute');
      const timestamp = startOfMinute(t.time.toISOString()).toISOString();

      if (this.map.has(timestamp)) {
        console.log('has it');
        const previousCandle = this.map.get(timestamp);
        const newCandleState = updateCandleFromTradeMessage(previousCandle, t);
        console.log(newCandleState);
        this.map.set(timestamp, newCandleState);
        // update it.
      } else {
        // create it it
        const newCandle = createCandleFromTradeMessage(t);
        this.map.set(timestamp, newCandle);
      }
    } else {
      // check if ahead or behind current minute
      if (isAfter(t.time, this.currentMinute)) {
        console.log('is after');
        const minutesDiff = differenceInMinutes(t.time, this.currentMinute);
        console.log(minutesDiff);
      } else if (isBefore(t.time, this.currentMinute)) {
        console.log('is before');
      } else {
        this.logger.log('error', 'this should never happen');
      }
      this.logger.log('debug', 'different minute');
    }
    this.map.forEach(this.printMap);
  }

  private printMap(value: any, key: any, map: Map<any, any>) {
    console.log(`m[${key}] = ${JSON.stringify(value)}`);
  }

  // private hasCurrentMinute() {
  //   return this.map.has(;
  // }

  private log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message, meta);
  }
}

const createCandleFromTradeMessage = (t: TradeMessage) => {
  const timestamp = startOfMinute(t.time).toISOString();
  console.log(`price: ${t.price}`);
  const open = t.price;
  const close = t.price;
  const high = t.price;
  const low = t.price;
  const volume = t.size;

  const candle = createCandle({
    timestamp,
    open,
    close,
    high,
    low,
    volume,
  });
  return candle;
};

const createCandle = ({
  timestamp,
  open,
  close,
  high,
  low,
  volume,
}: Candle) => {
  const candle: Candle = {
    timestamp,
    open,
    close,
    high,
    low,
    volume,
  };
  return candle;
};

const updateCandleFromTradeMessage = (previous: Candle, t: TradeMessage) => {
  const x = Object.assign({}, previous);
  x.close = min([+x.close, +t.price]).toString();
  x.low = min([+x.close, +t.price]).toString();
  x.open = max([+x.close, +t.price]).toString();
  x.high = max([+x.close, +t.price]).toString();
  x.volume = sum([+x.volume, +t.size]).toString();
  return x;
};

export { OrderbookHistory };
