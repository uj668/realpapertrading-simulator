/**
 * Calculate new average cost basis after a purchase
 */
export function calculateNewAvgCost(currentQuantity, currentAvgCost, newQuantity, newPrice) {
  if (currentQuantity === 0) return newPrice;
  
  const totalCost = (currentQuantity * currentAvgCost) + (newQuantity * newPrice);
  const totalQuantity = currentQuantity + newQuantity;
  
  return totalCost / totalQuantity;
}

/**
 * Calculate unrealized profit/loss for a position
 */
export function calculateUnrealizedPL(quantity, avgCostBasis, currentPrice) {
  return (currentPrice - avgCostBasis) * quantity;
}

/**
 * Calculate unrealized profit/loss percentage
 */
export function calculateUnrealizedPLPercent(avgCostBasis, currentPrice) {
  if (avgCostBasis === 0) return 0;
  return ((currentPrice - avgCostBasis) / avgCostBasis) * 100;
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(cash, positions) {
  const positionsValue = positions.reduce((total, pos) => {
    return total + (pos.quantity * pos.currentPrice);
  }, 0);
  
  return cash + positionsValue;
}

/**
 * Calculate market value of a position
 */
export function calculateMarketValue(quantity, currentPrice) {
  return quantity * currentPrice;
}

/**
 * Calculate how many shares can be bought with given amount
 */
export function calculateSharesFromAmount(amountEUR, pricePerShare) {
  return amountEUR / pricePerShare;
}

/**
 * Calculate total cost for buying shares
 */
export function calculateTotalCost(quantity, pricePerShare) {
  return quantity * pricePerShare;
}

/**
 * Format currency (EUR)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Format number with decimals
 */
export function formatNumber(value, decimals = 2) {
  return value.toFixed(decimals);
}

