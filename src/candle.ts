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

interface ICandle {
  timestamp: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
}

class Candle implements ICandle {
  timestamp: string = null;
  open: string = null;
  close: string = null;
  high: string = null;
  low: string = null;
  volume: string = null;

  private openTimestamp: string = null;
  private closeTimestamp: string = null;

  constructor({ timestamp, open, close, high, low, volume }: ICandle) {
    this.timestamp = timestamp;
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.volume = volume;
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
}: ICandle) => {
  const candle: ICandle = {
    timestamp,
    open,
    close,
    high,
    low,
    volume,
  };
  return candle;
};

const updateCandleFromTradeMessage = (previous: ICandle, t: TradeMessage) => {
  const x = Object.assign({}, previous);
  x.close = min([+x.close, +t.price]).toString();
  x.low = min([+x.close, +t.price]).toString();
  x.open = max([+x.close, +t.price]).toString();
  x.high = max([+x.close, +t.price]).toString();
  x.volume = sum([+x.volume, +t.size]).toString();
  return x;
};


export { ICandle, Candle };
