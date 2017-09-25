import { BigNumber } from 'bignumber.js';
export type NumberLike = number | string | BigNumber;
export const big = BigNumber.another({
  ROUNDING_MODE: 4,
  ERRORS: false,
  CRYPTO: false,
});
export const Big = (x: NumberLike): BigNumber => new big(x);
export const ZERO = Big(0);
export const ONE = Big(1);
export type Biglike = NumberLike;
export type BigJS = BigNumber.BigNumber;
