export const formatMoney = (num) => {
  return Number(num || 0).toFixed(2)
}

export const formatPercent = (num) => {
  return `${Number(num || 0).toFixed(2)}%`
}