import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Debug: Log API key status on module load
console.log('🔧 Alpha Vantage Module Loaded');
console.log('🔑 API Key present:', !!API_KEY);
console.log('🔑 API Key value:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING!');

// Cache to reduce API calls (important for free tier - 25 calls/day limit!)
const priceCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes for real-time, longer for historical

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
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
    });

    const quote = response.data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('Symbol not found');
    }

    const data = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      timestamp: quote['07. latest trading day'],
    };

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching quote from Alpha Vantage:', error);
    throw new Error('Failed to fetch quote. Please try again.');
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

  console.log('🔍 Fetching historical quote for:', symbol, 'on', date);
  console.log('🔑 API Key present:', !!API_KEY);
  console.log('🔑 API Key value:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING');

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: 'compact', // Free tier: last 100 days only
        apikey: API_KEY,
      },
    });

    console.log('📥 API Response:', response.data);

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries) {
      console.error('❌ No time series data in response:', response.data);
      throw new Error('Symbol not found or no historical data available');
    }

    // Try to find data for the exact date
    let dayData = timeSeries[date];
    let actualDate = date;

    // If no data for this date (weekend/holiday), try previous days
    if (!dayData) {
      const dateObj = new Date(date);
      for (let i = 1; i <= 7; i++) {
        dateObj.setDate(dateObj.getDate() - 1);
        const tryDate = dateObj.toISOString().split('T')[0];
        if (timeSeries[tryDate]) {
          dayData = timeSeries[tryDate];
          actualDate = tryDate;
          break;
        }
      }
    }

    if (!dayData) {
      throw new Error('No trading data available for this date');
    }

    const data = {
      symbol: symbol.toUpperCase(),
      price: parseFloat(dayData['4. close']),
      open: parseFloat(dayData['1. open']),
      high: parseFloat(dayData['2. high']),
      low: parseFloat(dayData['3. low']),
      volume: parseInt(dayData['5. volume']),
      change: 0,
      changePercent: 0,
      timestamp: actualDate,
      isHistorical: true,
      actualDate: actualDate,
      requestedDate: date,
    };

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching historical quote from Alpha Vantage:', error);
    if (error.message.includes('API call frequency')) {
      throw new Error('API rate limit reached. Please wait a minute and try again.');
    }
    throw new Error('Failed to fetch historical data. Please try again.');
  }
}

/**
 * Get time series data for a symbol
 */
export async function getTimeSeries(symbol, interval = '1day', outputsize = 30) {
  const cacheKey = `timeseries_${symbol}_${interval}_${outputsize}`;
  const cached = priceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: outputsize > 100 ? 'full' : 'compact',
        apikey: API_KEY,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries) {
      throw new Error('Symbol not found or no data available');
    }

    // Convert to array and sort by date
    const data = Object.entries(timeSeries)
      .slice(0, outputsize)
      .map(([datetime, values]) => ({
        datetime,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching time series from Alpha Vantage:', error);
    throw new Error('Failed to fetch time series data. Please try again.');
  }
}

/**
 * Search for symbols
 */
export async function searchSymbol(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: API_KEY,
      },
    });

    const matches = response.data.bestMatches;
    
    if (!matches || !Array.isArray(matches)) {
      return [];
    }

    return matches.slice(0, 10).map(item => ({
      symbol: item['1. symbol'],
      name: item['2. name'],
      type: item['3. type'],
      region: item['4. region'],
      marketOpen: item['5. marketOpen'],
      marketClose: item['6. marketClose'],
      timezone: item['7. timezone'],
      currency: item['8. currency'],
      matchScore: parseFloat(item['9. matchScore']),
    }));
  } catch (error) {
    console.error('Error searching symbol in Alpha Vantage:', error);
    return [];
  }
}

/**
 * Get multiple quotes at once (Note: Alpha Vantage doesn't support batch requests in free tier)
 * This will make individual calls with delays to respect rate limits
 */
export async function getMultipleQuotes(symbols) {
  const quotes = [];
  
  // Check cache first
  for (const symbol of symbols) {
    const cacheKey = `quote_${symbol}`;
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      quotes.push(cached.data);
    }
  }
  
  // If all cached, return immediately
  if (quotes.length === symbols.length) {
    return quotes;
  }
  
  // Otherwise, fetch uncached ones (with rate limiting)
  const uncachedSymbols = symbols.filter(symbol => {
    const cacheKey = `quote_${symbol}`;
    const cached = priceCache.get(cacheKey);
    return !cached || Date.now() - cached.timestamp >= CACHE_DURATION;
  });
  
  for (let i = 0; i < uncachedSymbols.length; i++) {
    try {
      const quote = await getQuote(uncachedSymbols[i]);
      quotes.push(quote);
      
      // Wait 13 seconds between calls to respect 5 calls/minute limit (12s + 1s buffer)
      if (i < uncachedSymbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 13000));
      }
    } catch (error) {
      console.error(`Error fetching quote for ${uncachedSymbols[i]}:`, error);
      // Continue with other symbols
    }
  }
  
  return quotes;
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearCache() {
  priceCache.clear();
}

