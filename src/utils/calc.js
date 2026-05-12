export function calcDailyProfitValue(amount, rate) {
  return (Number(amount || 0) * Number(rate || 0)) / 100;
}

export function calcDailyProfit(amount, rate) {
  return calcDailyProfitValue(amount, rate).toFixed(2);
}
