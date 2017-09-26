// RSI:
// Average Gain = Sum of Gains over the past 14 periods / 14.
// Average Loss = Sum of Losses over the past 14 periods / 14
// RS = Average Gain / Average Loss;
// RSI = 100 - (100 / (1 + RS))

import { isNil } from 'lodash';
import { Logger } from 'gdax-trading-toolkit/build/src/utils';

import { getNPreviousCandles, getPreviousCandle } from '../util';
import { Candle } from '../candle';

const DEFAULT_PERIODS = 14;

const calculateAverageGain = (windowOfGainOrLoss: Array<number>) => {
  const windowGains = windowOfGainOrLoss.map(val => Math.max(val, 0));
  const gainTotal = windowGains.reduce((total, cur) => {
    return (total += cur);
  }, 0);
  const gainAvg = gainTotal / windowGains.length;
  return gainAvg;
};

const calculateAverageLoss = (windowOfGainOrLoss: Array<number>) => {
  const windowLosses = windowOfGainOrLoss.map(val => Math.abs(Math.min(val, 0)));
  const lossTotal = windowLosses.reduce((total, cur) => {
    return (total += cur);
  }, 0);
  const lossAvg = lossTotal / windowLosses.length;
  return lossAvg;
};

const calculateRsiFromRs = (rs: number) => {
  if (rs === -1 ) {
    console.error('RS is -1');
    return 0;
  }
  const rsi = 100.0 - 100.0 / (1 + rs);
  return rsi;
};

const calculateRs = (avgGain: number, avgLoss: number) => {
  if (avgLoss === 0){
    console.log('rs is 0');
    return 0;
  }
  const rs = avgGain / avgLoss;
  return rs;
};

// windowGainOrLoss = [-3.23, 4.76, ...]
const calculateRsiFirst = (windowOfGainOrLoss: Array<number>) => {
  const avgGain = calculateAverageGain(windowOfGainOrLoss);
  const avgLoss = calculateAverageLoss(windowOfGainOrLoss);

  const rs = calculateRs(avgGain, avgLoss);
  const rsi = calculateRsiFromRs(rs);
  return {
    avgGain,
    avgLoss,
    rs,
    rsi,
  };
};

const calculateRsiSubsequent = (
  prevGainAvg: number,
  prevLossAvg: number,
  currentGain: number,
  currentLoss: number,
  periods: number = DEFAULT_PERIODS
) => {
  const avgGain = (prevGainAvg * (periods - 1) + currentGain) / periods;
  const avgLoss = (prevLossAvg * (periods - 1) + currentLoss) / periods;

  const smoothedRS = calculateRs(avgGain, avgLoss);
  const rsi = calculateRsiFromRs(smoothedRS);

  return {
    avgGain,
    avgLoss,
    rs: smoothedRS,
    rsi,
  };
};

const diff = (arr: Array<number>) =>
  arr.map((cur, idx, arr) => {
    const prev = arr[idx - 1] || cur;
    const change = cur - prev;
    return change;
});

export interface ICalculator {
  calculate(candle: any, save: boolean): any
}

class RsiCalculator implements ICalculator {
  prevAvgGain: number;
  prevAvgLoss: number;
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  calculate(c: Candle, save: boolean = true): any {
    if (isNil(this.prevAvgGain && isNil(this.prevAvgLoss))) {
      const n: number = 15;
      const candles = getNPreviousCandles(c, n);
      const numberOfMissingCandles = candles.filter(isNil).length;
      if (numberOfMissingCandles > 0) {
        this.log('debug', `Candle is missing ${numberOfMissingCandles} (out of ${n}) candles to calculate RSI`);
        return null;
      }
      this.log('debug', `Enough candles received, calculating RSI`);
      
      const closePrices = candles.map(candle => !isNil(candle.close) ? +candle.close : +candle.current);
      console.log(closePrices);

      if (closePrices.filter(isNil).length > 0) {
        this.log('error', 'Error calculating RSI, there is a undefined or null value in it', closePrices);
      }

      const gainsAndLosses = diff(closePrices); // Gains and losses array
      // remove first number;
      gainsAndLosses.shift();
      console.log(gainsAndLosses);
      const { avgGain, avgLoss, rsi, rs } = calculateRsiFirst(gainsAndLosses);
      console.log(avgGain, avgLoss);

      if (save) {
        this.prevAvgGain = avgGain;
        this.prevAvgLoss = avgLoss;
      }

      console.log(rsi);
      this.log('debug', `${c.timestamp} RSI (first calculation): ${rsi}`);
      return rsi;
    } else {
      this.log('error', 'We have a previous RSI');

      const previousClose = +getPreviousCandle(c).close;
      const currentClose = !isNil(c.close) ? +c.close : +c.current;
      const currentGainOrLoss = currentClose - previousClose;

      const currentGain = Math.max(currentGainOrLoss, 0);
      const currentLoss = Math.abs(Math.min(currentGainOrLoss, 0));

      const { avgGain, avgLoss, rs, rsi } = calculateRsiSubsequent(
        this.prevAvgGain,
        this.prevAvgLoss,
        currentGain,
        currentLoss,
        14,
      );

      if (save) {
        this.prevAvgGain = avgGain;
        this.prevAvgLoss = avgLoss;
      }
      console.log(avgGain, avgLoss, rs, rsi);
      return rsi;
    }
  }

  private log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message, meta);
  }
}

export { calculateRsiFirst, calculateRsiSubsequent, RsiCalculator, };
