import { startOfMinute, isSameMinute, isAfter, isBefore, differenceInMinutes } from 'date-fns';
import { TradeMessage } from 'gdax-trading-toolkit/build/src/core';
import { Logger } from 'gdax-trading-toolkit/build/src/utils';
import { max, min, sum } from 'lodash';
import { OrderbookHistory } from './orderbook-history';

interface ICandle {
  timestamp?: Date;
  open?: string;
  close?: string;
  high?: string;
  low?: string;
  volume?: string;
  current?: string;
}

interface ICandleMetadata {
  openTimestamp?: Date;
  latestTimestampSoFar?: Date;
  closeTimestamp?: Date;
  confirmed?: boolean;
}

interface ICoordinatorChild {
  parent: OrderbookHistory;
}

class Candle implements ICandle, ICandleMetadata, ICoordinatorChild {
  timestamp: Date;
  close: string;
  high: string;
  low: string;
  volume: string;
  current: string;

  open: string;
  openTimestamp: Date;
  latestTimestampSoFar: Date;
  closeTimestamp: Date;
  confirmed: boolean;

  parent: OrderbookHistory;

  constructor({
    open,
    close,
    high,
    low,
    volume,
    current,
    timestamp,
    confirmed,
    parent,
  }: ICandle & ICandleMetadata & ICoordinatorChild) {
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
    this.parent = parent;
  }
}

export { ICandle, ICandleMetadata, ICoordinatorChild, Candle };
