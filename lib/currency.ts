import currency from 'currency.js'

export const usd = (value: number) =>
  currency(value, { symbol: '$', precision: 2 })

export const vnd = (value: number) =>
  currency(value, { symbol: '₫', separator: '.', decimal: ',', precision: 0 })

export { currency }
