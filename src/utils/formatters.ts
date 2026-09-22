export function formatR(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00R';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}R`;
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number | undefined | null, currency: string = '$'): string {
  if (value === undefined || value === null || isNaN(value)) return `${currency}0.00`;
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${prefix}${currency}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatProfitFactor(pf: number | null | undefined): string {
  if (pf === null || pf === undefined) return 'N/A';
  return pf.toFixed(2);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}
