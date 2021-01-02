export const centsToString = (amountCents) => {
    const euros = Math.floor(amountCents / 100)
    const cents = amountCents % 100 ? `,${amountCents % 100}` : ''
    return `${euros}${cents}`
}
