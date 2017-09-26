import { rangeRight } from 'lodash';
import { subMinutes } from 'date-fns';
import { Candle } from './candle';

function isDefined(d: any) {
	return d !== null && typeof d != "undefined";
}

function getNPreviousCandles(c: Candle, n: number = 14, inclusive: boolean = true): Array<Candle> {
  const range = inclusive ? rangeRight(0, n) : rangeRight(1, n + 1);
  const candles = range.map(n => c.parent.getCandle(subMinutes(c.timestamp, n).getTime()));
  return candles;
}

function getPreviousCandle(c: Candle): Candle {
  return c.parent.getCandle(subMinutes(c.timestamp, 1).getTime());
}

export {
  isDefined,
  getPreviousCandle,
  getNPreviousCandles,
}