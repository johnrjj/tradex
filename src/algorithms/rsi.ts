// RSI:
// Average Gain = Sum of Gains over the past 14 periods / 14.
// Average Loss = Sum of Losses over the past 14 periods / 14
// RS = Average Gain / Average Loss;
// RSI = 100 - (100 / (1 + RS))

const DEFAULT_PERIODS = 14;

const calculateAverageGain = (windowOfGainOrLoss: Array<number>) => {
  const windowGains = windowOfGainOrLoss.map(val => Math.max(val, 0));
  const gainTotal = windowGains.reduce((total, cur) => {
    return (total += cur);
  }, 0);
  const gainAvg = gainTotal / 14; //windowGains.length;
  return gainAvg;
};

const calculateAverageLoss = (windowOfGainOrLoss: Array<number>) => {
  const windowLosses = windowOfGainOrLoss.map(val => Math.abs(Math.min(val, 0)));
  const lossTotal = windowLosses.reduce((total, cur) => {
    return (total += cur);
  }, 0);
  const lossAvg = lossTotal / 14; //windowLosses.length;
  return lossAvg;
};

const calculateRsiFromRs = (rs: number) => {
  const rsi = 100.0 - 100.0 / (1 + rs);
  return rsi;
};

const calculateRs = (avgGain: number, avgLoss: number) => {
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

export { calculateRsiFirst, calculateRsiSubsequent };
