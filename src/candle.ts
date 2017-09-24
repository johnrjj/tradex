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
  timestamp?: Date;
  open?: string;
  close?: string;
  high?: string;
  low?: string;
  volume?: string;
  current?: string;
  confirmed?: boolean;
}

class Candle implements ICandle {
  timestamp: Date;
  close: string;
  high: string;
  low: string;
  volume: string;
  current: string;

  open: string;
  openTimestamp: Date;
  latestTimestampSoFar: Date = null;

  closeTimestamp: Date = null;
  confirmed: boolean;

  constructor({
    open,
    close,
    high,
    low,
    volume,
    current,
    timestamp,
    confirmed,
  }: ICandle) {
    this.timestamp = startOfMinute(timestamp);
    this.latestTimestampSoFar = timestamp;
    this.openTimestamp = timestamp;
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.volume = volume;
    this.current = current;
    this.confirmed = confirmed || false;
  }
}

export { ICandle, Candle };
