import { init } from '@instantdb/react';

// Initialize InstantDB
// Get app ID from environment variable
const APP_ID = '959b5976-79ee-4df6-83f4-2834e81a390e';

// Initialize InstantDB - returns an object with methods
const db = init({ appId: APP_ID });

// Export as default
export default db;

// Schema definition (for reference - configured in InstantDB dashboard):
// - users: { username, initialBalance, currentCash }
// - watchlist: { userId, symbol, addedAt }
// - trades: { userId, symbol, type, quantity, pricePerShare, totalAmount, timestamp }
// - positions: { userId, symbol, quantity, avgCostBasis }
// - portfolioSnapshots: { userId, totalValue, cash, positionsValue, timestamp }

