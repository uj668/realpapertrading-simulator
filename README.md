# RealPaperTrading Simulator 📈

A full-featured paper trading application that simulates real stock trading with live prices from Twelve Data API. Trade stocks with virtual money and track your portfolio performance over time!

## Features

- 🔐 **User Authentication** - Secure signup/login with InstantDB
- 💰 **Virtual Trading** - Start with €10,000 virtual cash
- 📊 **Real-Time Prices** - Live stock prices from Twelve Data API
- 📈 **Portfolio Management** - Track positions, profit/loss, and total value
- 🔄 **Auto-Refresh** - Prices update automatically every 60 seconds
- 💹 **Fractional Shares** - Buy and sell fractional shares
- 📉 **Interactive Charts** - Three comprehensive charts:
  - Stock price history
  - Portfolio value over time
  - Profit/Loss tracking
- 📜 **Trade History** - Complete transaction history with filters and CSV export
- 🌍 **Multi-Language** - English and Lithuanian language support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript
- **Database:** InstantDB (realtime database with built-in auth)
- **Stock Data:** Twelve Data API
- **Styling:** Tailwind CSS + Custom Components
- **Charts:** Recharts
- **Utilities:** date-fns, axios, lucide-react

## Getting Started

### Prerequisites

- Node.js 18+ installed
- InstantDB account (get one at [instantdb.com](https://instantdb.com))
- Twelve Data API key (provided in the project)

### Installation

1. Clone this repository:
```bash
cd "Cursor-Paper Trading Company"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_TWELVE_DATA_API_KEY=6d8e110e8f884e4782c3af257e57f7df
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id_here
```

4. Set up InstantDB:
   - Go to [instantdb.com/dash](https://instantdb.com/dash)
   - Create a new app
   - Copy your App ID and paste it in `.env.local`
   - The schema will be created automatically when you use the app

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables:
   - `NEXT_PUBLIC_TWELVE_DATA_API_KEY`
   - `NEXT_PUBLIC_INSTANT_APP_ID`

4. Deploy!

Your app will be live at `https://your-project-name.vercel.app`

## Usage Guide

### Creating an Account

1. Click "Sign Up" on the homepage
2. Enter your email, password, and optional username
3. You'll start with €10,000 virtual cash

### Making Trades

1. Go to the "Trade" page
2. Enter a stock symbol (e.g., AAPL, TSLA, GOOGL)
3. Choose BUY or SELL
4. Enter amount in EUR or quantity of shares
5. Review the preview and confirm

### Viewing Portfolio

1. Go to the "Portfolio" page
2. See all your positions with current values
3. View total profit/loss
4. Enable auto-refresh for live price updates

### Analyzing Performance

1. Go to the "History" page
2. View complete trade history with filters
3. Analyze three interactive charts:
   - Stock price movements
   - Portfolio value over time
   - Profit/Loss trends
4. Export trade history to CSV

### Language Toggle

Click the language button in the navigation bar to switch between English 🇬🇧 and Lithuanian 🇱🇹.

## InstantDB Schema

The application uses the following schema in InstantDB:

- **users**: User profiles with balance information
  - `username`, `initialBalance`, `currentCash`, `createdAt`

- **positions**: Current stock positions
  - `userId`, `symbol`, `quantity`, `avgCostBasis`

- **trades**: Trade history
  - `userId`, `symbol`, `type`, `quantity`, `pricePerShare`, `totalAmount`, `timestamp`

- **portfolioSnapshots**: Historical portfolio values
  - `userId`, `totalValue`, `cash`, `positionsValue`, `timestamp`

## API Rate Limits

Twelve Data free tier limitations:
- 8 API calls per minute
- 800 calls per day

The app implements caching to minimize API calls:
- Prices cached for 60 seconds
- Batch fetching for multiple symbols
- Manual refresh available

## Key Features Explained

### Fractional Shares

Buy any amount of stock, not just whole shares. For example, buy €100 worth of a stock priced at €150/share and own 0.67 shares.

### Average Cost Basis

When you buy the same stock multiple times, the app calculates your average purchase price:
```
avgCost = (currentQty × currentAvg + newQty × newPrice) / (currentQty + newQty)
```

### Portfolio Snapshots

The app automatically saves your portfolio value periodically to show historical performance in charts.

### Auto-Refresh

Prices update automatically every 60 seconds when enabled. The refresh pauses when the browser tab is inactive to save API calls.

## Troubleshooting

### "Symbol not found" error
- Make sure you're using valid stock symbols
- Try searching for the company name first
- Some symbols may not be available in the Twelve Data free tier

### Prices not updating
- Check your internet connection
- Verify your Twelve Data API key is valid
- You may have hit the API rate limit (wait a minute and try again)

### Authentication issues
- Verify your InstantDB App ID is correct in `.env.local`
- Clear browser cache and cookies
- Try signing out and signing in again

## Contributing

This is a learning project. Feel free to fork and modify for your own use!

## License

ISC

## Acknowledgments

- Stock data provided by [Twelve Data](https://twelvedata.com)
- Database and auth by [InstantDB](https://instantdb.com)
- Built with [Next.js](https://nextjs.org)

