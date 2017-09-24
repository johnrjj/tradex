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
import { ICandle, Candle } from './candle';

class OrderbookHistory {
  private readonly logger: Logger;
  private readonly product: string;
  private readonly baseCurrency: string;
  private readonly quoteCurrency: string;
  private currentMinute: Date;
  private map = new Map<string, Candle>();

  constructor({ logger, product }: { logger?: Logger; product: string }) {
    this.logger = logger;
    this.product = product;
    [this.baseCurrency, this.quoteCurrency] = this.product.split('-');
    this.currentMinute = startOfMinute(new Date());
  }

  public addTradeMessageToHistory(t: TradeMessage) {

    const tradeMessageStartOfMinute: Date = startOfMinute(t.time);
    const tradeMessageStartOfMinuteTimestamp: string = tradeMessageStartOfMinute.toISOString();

    if (this.isTradeMessageInCurrentWindow(t)) {
      this.logger.log('debug', `Received trade message in current minute window [${this.currentMinute}]`);
      this.addTradeMessage(t);
    } else {
      // check if ahead or behind current minute
      if (isAfter(t.time, this.currentMinute)) {
        const minutesDiff = differenceInMinutes(t.time, this.currentMinute);
        
        this.logger.log('debug', `Received trade message for ${minutesDiff} minute(s) ahead of current minute window 
          [Latest: ${tradeMessageStartOfMinute}], [CurMinuteWindowBeforeUpdate: ${this.currentMinute}]`);
        
        // close current candle...
        const oldCurrentMinute = this.currentMinute;
        const candleToClose = this.map.get(oldCurrentMinute.toISOString());
        closeCandle(candleToClose);
        this.logger.log('debug', `Closed current candle @ ${oldCurrentMinute} @ ${candleToClose.close}`);
        this.logger.log('debug', `Closed candle data: ${JSON.stringify(candleToClose)}`);

        // // now move the current minute up
        const newCurrentMinute = startOfMinute(t.time);
        this.currentMinute = newCurrentMinute;
        this.logger.log('debug', `Moved current window up to ${t.time}`);
        this.logger.log('debug', `Adding new candle for ${t.time}`);
        this.addTradeMessage(t);
      } else if (isBefore(t.time, this.currentMinute)) {
        this.logger.log('info', `Received trade message for a previous minute window (${t.time.toISOString()})`);
        // need logic here...
      } else {
        this.logger.log('error', 'Fell into a black hole...help');
      }
    }

    // this.printMap();
  }

  private addTradeMessage(t: TradeMessage) {
    const tradeMessageStartOfMinute: Date = startOfMinute(t.time);
    const tradeMessageStartOfMinuteTimestamp: string = tradeMessageStartOfMinute.toISOString();

    if (this.doesCandleAlreadyExists(tradeMessageStartOfMinuteTimestamp)) {
      const previousCandle = this.map.get(tradeMessageStartOfMinuteTimestamp);
      updateByTradingMessage(previousCandle, t);
    } else {
      const candle = createCandleFromTradeMessage(t);
      this.map.set(tradeMessageStartOfMinuteTimestamp, candle);
    }
  }

  private addTradeMessageToCurrentWindow() {

  }

  private addTradeMessageToPreviousWindow() {

  }

  private addTradeMessageToFutureWindow() {

  }

  private printMap() {
    this.map.forEach((value, key) => console.log(`m[${key}] = ${JSON.stringify(value)}`));
  }

  private doesCandleAlreadyExists(minuteTimestamp: string): boolean {
    return this.map.has(minuteTimestamp);
  }

  private isTradeMessageInCurrentWindow(t: TradeMessage): boolean {
    return isSameMinute(t.time, this.currentMinute);
  }

  private log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message, meta);
  }
}

const createCandleFromTradeMessage = (t: TradeMessage): Candle => {
  const { price, size, time } = t;
  const miniuteFloored = startOfMinute(t.time);
  const c = new Candle({
    current: price,
    open: price,
    high: price,
    low: price,
    timestamp: time,
    volume: size,
  });
  return c;
}

const updateByTradingMessage = (c: Candle, t: TradeMessage): Candle => {
  // We have a new open price, must have arrived out of order.
  if (isBefore(t.time, c.openTimestamp)) {
    console.log('out of order update');
    c.openTimestamp = t.time;
    c.open = t.price;
  }

  // Update latest time
  c.latestTimestampSoFar = t.time;
  c.current = t.price;
  c.high = max([+c.high, +t.price]).toString();
  c.low = min([+c.high, +t.price]).toString();
  c.volume = sum([+c.volume, +t.size]).toString();
  return c;
}

const closeCandle = (c: Candle): Candle => {
  c.close = c.current;
  c.closeTimestamp = c.latestTimestampSoFar;
  return c;
}

export { OrderbookHistory };
