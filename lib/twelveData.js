import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Cache to reduce API calls
const priceCache = new Map();
const CACHE_DURATION = 60000; // 60 seconds

/**
 * Get current or historical quote for a symbol
 * @param {string} symbol - Stock symbol
 * @param {Date|string} date - Optional date. Can be Date object or YYYY-MM-DD string. If null, gets current price
 */
export async function getQuote(symbol, date = null) {
  // If date is provided, use historical quote
  if (date) {
    // Convert Date object to YYYY-MM-DD string if needed
    let dateStr = date;
    if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    }
    return getHistoricalQuote(symbol, dateStr);
  }

  // Otherwise, get current quote
  const cacheKey = `quote_${symbol}`;
  const cached = priceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
    });

    if (response.data.code === 400 || response.data.code === 404) {
      throw new Error(response.data.message || 'Symbol not found');
    }

    const data = {
      symbol: response.data.symbol,
      price: parseFloat(response.data.close || response.data.price),
      change: parseFloat(response.data.change || 0),
      changePercent: parseFloat(response.data.percent_change || 0),
      timestamp: response.data.timestamp || Date.now(),
    };

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}

/**
 * Get historical quote for a specific date
 * @param {string} symbol - Stock symbol
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getHistoricalQuote(symbol, date) {
  const cacheKey = `historical_${symbol}_${date}`;
  const cached = priceCache.get(cacheKey);
  
  // Cache historical prices longer (they don't change)
  if (cached) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol: symbol.toUpperCase(),
        interval: '1day',
        start_date: date,
        end_date: date,
        apikey: API_KEY,
      },
    });

    if (response.data.code === 400 || response.data.code === 404) {
      throw new Error(response.data.message || 'Symbol not found');
    }

    if (!response.data.values || response.data.values.length === 0) {
      // If no data for this date (weekend/holiday), try previous day
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      // Try up to 5 days back to find a trading day
      for (let i = 1; i <= 5; i++) {
        const tryDate = new Date(date);
        tryDate.setDate(tryDate.getDate() - i);
        const tryDateStr = tryDate.toISOString().split('T')[0];
        
        const retryResponse = await axios.get(`${BASE_URL}/time_series`, {
          params: {
            symbol: symbol.toUpperCase(),
            interval: '1day',
            start_date: tryDateStr,
            end_date: tryDateStr,
            apikey: API_KEY,
          },
        });
        
        if (retryResponse.data.values && retryResponse.data.values.length > 0) {
          const item = retryResponse.data.values[0];
          const data = {
            symbol: symbol.toUpperCase(),
            price: parseFloat(item.close),
            change: 0,
            changePercent: 0,
            timestamp: item.datetime,
            isHistorical: true,
            actualDate: tryDateStr,
            requestedDate: date,
          };
          
          priceCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
      
      throw new Error('No trading data available for this date');
    }

    const item = response.data.values[0];
    const data = {
      symbol: symbol.toUpperCase(),
      price: parseFloat(item.close),
      change: 0,
      changePercent: 0,
      timestamp: item.datetime,
      isHistorical: true,
      actualDate: date,
    };

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching historical quote:', error);
    throw error;
  }
}

/**
 * Get time series data for a symbol
 */
export async function getTimeSeries(symbol, interval = '1day', outputsize = 30) {
  try {
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        outputsize,
        apikey: API_KEY,
      },
    });

    if (response.data.code === 400 || response.data.code === 404) {
      throw new Error(response.data.message || 'Symbol not found');
    }

    if (!response.data.values || !Array.isArray(response.data.values)) {
      throw new Error('Invalid response format');
    }

    return response.data.values.map(item => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume || 0),
    }));
  } catch (error) {
    console.error('Error fetching time series:', error);
    throw error;
  }
}

/**
 * Search for symbols
 */
export async function searchSymbol(query) {
  try {
    const response = await axios.get(`${BASE_URL}/symbol_search`, {
      params: {
        symbol: query,
        apikey: API_KEY,
      },
    });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map(item => ({
      symbol: item.symbol,
      name: item.instrument_name,
      exchange: item.exchange,
      type: item.instrument_type,
    }));
  } catch (error) {
    console.error('Error searching symbol:', error);
    return [];
  }
}

/**
 * Get multiple quotes at once (batch)
 */
export async function getMultipleQuotes(symbols) {
  const symbolString = symbols.join(',');
  const cacheKey = `batch_${symbolString}`;
  const cached = priceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: symbolString,
        apikey: API_KEY,
      },
    });

    let quotes = [];
    if (Array.isArray(response.data)) {
      quotes = response.data.map(item => ({
        symbol: item.symbol,
        price: parseFloat(item.close || item.price),
        change: parseFloat(item.change || 0),
        changePercent: parseFloat(item.percent_change || 0),
        timestamp: item.timestamp || Date.now(),
      }));
    } else if (response.data.symbol) {
      quotes = [{
        symbol: response.data.symbol,
        price: parseFloat(response.data.close || response.data.price),
        change: parseFloat(response.data.change || 0),
        changePercent: parseFloat(response.data.percent_change || 0),
        timestamp: response.data.timestamp || Date.now(),
      }];
    }

    priceCache.set(cacheKey, { data: quotes, timestamp: Date.now() });
    return quotes;
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    throw error;
  }
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearCache() {
  priceCache.clear();
}

