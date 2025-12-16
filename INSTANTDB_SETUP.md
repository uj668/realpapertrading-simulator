# InstantDB Setup Guide

This guide will walk you through setting up InstantDB for the RealPaperTrading Simulator.

## Step 1: Create an InstantDB Account

1. Go to [https://instantdb.com](https://instantdb.com)
2. Click "Sign Up" or "Get Started"
3. Create your account with email/password or GitHub

## Step 2: Create a New App

1. Once logged in, you'll see the InstantDB dashboard
2. Click "Create App" or "New App"
3. Give your app a name (e.g., "RealPaperTrading")
4. Click "Create"

## Step 3: Get Your App ID

1. After creating your app, you'll see your App ID
2. It looks something like: `abc123-def456-ghi789`
3. Copy this App ID

## Step 4: Add App ID to Your Project

1. In your project root, find or create `.env.local` file
2. Add your App ID:
```
NEXT_PUBLIC_TWELVE_DATA_API_KEY=6d8e110e8f884e4782c3af257e57f7df
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here
```
3. Replace `your_app_id_here` with your actual App ID
4. Save the file

## Step 5: Schema Configuration (Optional)

InstantDB will automatically create the schema when you first use the app. However, if you want to set it up manually in the dashboard:

### Users Table
- No need to create manually - handled by InstantDB auth

### Custom Tables

You can define these in the InstantDB dashboard under "Schema":

**positions**
```json
{
  "userId": "string",
  "symbol": "string",
  "quantity": "number",
  "avgCostBasis": "number"
}
```

**trades**
```json
{
  "userId": "string",
  "symbol": "string",
  "type": "string",
  "quantity": "number",
  "pricePerShare": "number",
  "totalAmount": "number",
  "timestamp": "number"
}
```

**portfolioSnapshots**
```json
{
  "userId": "string",
  "totalValue": "number",
  "cash": "number",
  "positionsValue": "number",
  "timestamp": "number"
}
```

**Note:** The app will create these automatically when data is first inserted, so manual schema creation is optional.

## Step 6: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try signing up with a test account

4. If successful, you're all set! 🎉

## Troubleshooting

### "Invalid App ID" Error
- Double-check your App ID in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### Authentication Not Working
- Verify your App ID is correct
- Check the InstantDB dashboard for any error logs
- Clear browser cache and try again

### Data Not Saving
- Check browser console for errors
- Verify InstantDB dashboard shows your app is active
- Make sure you're logged in before trying to save data

## InstantDB Features Used

This app uses the following InstantDB features:

- **Authentication**: Built-in email/password auth
- **Real-time Database**: Instant updates across clients
- **Queries**: Filtering and ordering data
- **Transactions**: Atomic updates for trades
- **Relations**: Linking users to their data

## Additional Resources

- [InstantDB Documentation](https://docs.instantdb.com)
- [InstantDB React Guide](https://docs.instantdb.com/docs/react)
- [InstantDB Schema Reference](https://docs.instantdb.com/docs/schema)

## Need Help?

- Check the [InstantDB Discord](https://discord.gg/instantdb)
- Review the [InstantDB Examples](https://github.com/instantdb/instant-examples)
- Read the [FAQ](https://docs.instantdb.com/docs/faq)

