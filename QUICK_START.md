# Quick Start Guide 🚀

Get your RealPaperTrading Simulator up and running in 5 minutes!

## 1. Set Up InstantDB (2 minutes)

1. Go to [instantdb.com](https://instantdb.com) and create a free account
2. Create a new app in the dashboard
3. Copy your App ID (looks like `abc123-def456-ghi789`)
4. Create a file named `.env.local` in the project root:

```bash
NEXT_PUBLIC_TWELVE_DATA_API_KEY=6d8e110e8f884e4782c3af257e57f7df
NEXT_PUBLIC_INSTANT_APP_ID=paste_your_app_id_here
```

**Note:** Replace `paste_your_app_id_here` with your actual App ID from step 3.

For detailed instructions, see [INSTANTDB_SETUP.md](INSTANTDB_SETUP.md)

## 2. Install Dependencies (1 minute)

```bash
npm install
```

## 3. Run the Development Server (30 seconds)

```bash
npm run dev
```

## 4. Open in Browser (10 seconds)

Open [http://localhost:3000](http://localhost:3000)

## 5. Create Your Account (1 minute)

1. Click "Sign Up"
2. Enter email and password
3. Optional: Add a username
4. Click "Sign Up"

You'll start with **€10,000** virtual cash! 💰

## Your First Trade

1. Go to the **Trade** page
2. Enter a stock symbol (try `AAPL` or `TSLA`)
3. Wait for the price to load
4. Choose **BUY**
5. Enter an amount (e.g., `1000` EUR)
6. Review the preview
7. Click **Confirm**

Congratulations! You've made your first trade! 🎉

## Explore Features

### Portfolio Page 📊
- View all your positions
- See real-time prices
- Track profit/loss
- Enable auto-refresh (updates every 60s)

### Trade Page 💹
- Buy and sell stocks
- Use fractional shares
- See recent trades
- Real-time price quotes

### History Page 📈
- View complete trade history
- Export to CSV
- Interactive charts:
  - Stock price movements
  - Portfolio value over time
  - Profit/Loss trends

### Language Toggle 🌍
Click the language button to switch between:
- 🇬🇧 English
- 🇱🇹 Lithuanian

## Tips for Best Experience

### Stock Symbols to Try
- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet (Google)
- **MSFT** - Microsoft
- **TSLA** - Tesla
- **AMZN** - Amazon
- **META** - Meta (Facebook)
- **NVDA** - NVIDIA

### Managing API Limits
The free Twelve Data API has limits:
- **8 calls per minute**
- **800 calls per day**

The app caches prices for 60 seconds to help with this.

### Understanding Your Portfolio

**Total Value** = Cash + (Sum of all position values)

**Profit/Loss** = Total Value - Initial Balance (€10,000)

**Position P/L** = (Current Price - Average Cost) × Quantity

### Fractional Shares

You can buy any amount! Examples:
- Buy €100 of a €150 stock = 0.67 shares
- Buy 2.5 shares of a €50 stock = €125

## Common Questions

**Q: Can I trade real money?**  
A: No, this is a simulator with virtual money only.

**Q: Are the prices real?**  
A: Yes! Prices come from Twelve Data API and reflect real market prices.

**Q: Can I reset my account?**  
A: Currently, you'd need to create a new account or manually sell all positions.

**Q: Why aren't prices updating?**  
A: Check auto-refresh is enabled, or you may have hit API limits (wait a minute).

**Q: Can multiple people use this?**  
A: Yes! Each user has their own account and portfolio.

## Next Steps

### Deploy to Production
Ready to share your app? See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel deployment instructions.

### Customize the App
- Modify initial balance in `app/signup/page.js`
- Change refresh interval in `app/portfolio/page.js`
- Add more stock exchanges
- Customize styling in components

## Need Help?

- 📚 Read the full [README.md](README.md)
- 🔧 Check [INSTANTDB_SETUP.md](INSTANTDB_SETUP.md) for database issues
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting help

## Project Structure

```
/
├── app/                    # Next.js pages
│   ├── portfolio/         # Portfolio view
│   ├── trade/             # Trading interface
│   ├── history/           # Charts & history
│   ├── login/             # Authentication
│   └── signup/            # User registration
├── components/            # React components
│   ├── ui/               # Basic UI components
│   └── ...               # Feature components
├── lib/                   # Core libraries
│   ├── instantdb.js      # Database
│   └── twelveData.js     # Stock API
├── hooks/                 # Custom React hooks
├── context/               # React contexts
├── utils/                 # Helper functions
└── .env.local            # Environment variables (create this!)
```

## Enjoy Trading! 📈

Happy paper trading! Remember: this is for learning and practice. The best way to learn trading is to practice without risking real money.

---

**Built with:** Next.js, InstantDB, Twelve Data API, Tailwind CSS, Recharts

