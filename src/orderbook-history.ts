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
import { ICandle } from './candle';

class OrderbookHistory {
  private readonly logger: Logger;
  private readonly product: string;
  private readonly baseCurrency: string;
  private readonly quoteCurrency: string;
  private currentMinute: Date;
  private map = new Map<string, ICandle>();

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
        const previousCandle = this.map.get(timestamp);
        const newCandleState = updateCandleFromTradeMessage(previousCandle, t);
        this.map.set(timestamp, newCandleState);
        // update it.
      } else {
        // create it it
        const newCandle = createCandleFromTradeMessage(t);
        this.map.set(timestamp, newCandle);
      }
    } else {
      this.logger.log('debug', 'different minute');
      // check if ahead or behind current minute
      if (isAfter(t.time, this.currentMinute)) {

        const minutesDiff = differenceInMinutes(t.time, this.currentMinute);

        const newCurrentMinute = startOfMinute(t.time);
        this.currentMinute = newCurrentMinute;

        // check if candle already exists, if not add it
        // if it exists, update it.

        // if already exists... (todo)

        // if doesn't exist...
        const newCandle = createCandleFromTradeMessage(t);
        this.map.set(newCurrentMinute.toISOString(), newCandle);


      } else if (isBefore(t.time, this.currentMinute)) {
        this.logger.log('error', 'had backflow thing :(');
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

  private log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message, meta);
  }
}

export { OrderbookHistory };
