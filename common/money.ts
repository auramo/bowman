export const centsToString = (amountCents: number): string => {
  const euros = Math.floor(amountCents / 100)
  const cents = amountCents % 100 ? `,${amountCents % 100}` : ',00'
  return `${euros}${cents}`
}

export const centsToDisplayString = (amountCents: number): string => {
  const euros = Math.floor(amountCents / 100)
  const cents = amountCents % 100 ? `,${amountCents % 100}` : ',00'
  const euroStr = euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `${euroStr}${cents}`
}

const moneyRegex = /(^\$?[\d]+),?(\d*?$)/

export const stringToCents = (euroString: string): number | null => {
  if (!euroString) return null
  const result = euroString.match(moneyRegex)
  if (result) {
    const rawCents = result[2] || '0'
    if (rawCents.length > 2) return null
    const cents = rawCents.length === 2 ? Number(rawCents) : Number(rawCents) * 10
    const euros = Number(result[1])
    return cents + euros * 100
  }
  return null
}
