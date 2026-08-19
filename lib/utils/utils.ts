export const formatPrice = (value: number, currency: string = 'BDT'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)

  return currency === 'BDT' ? `৳${formatted}` : `${currency} ${formatted}`
}
