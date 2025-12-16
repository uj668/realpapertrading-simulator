# InstantDB Authentication Setup - Complete Guide

## Current Status

Your app uses **InstantDB** with App ID: `959b5976-79ee-4df6-83f4-2834e81a390e`

## Option 1: Magic Code Authentication (Already Implemented)

### How it works:
1. User enters email
2. InstantDB sends a 6-digit code to their email
3. User enters code to verify
4. Account created + logged in

### Steps to use:

1. **Clear Demo Mode:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `localStorage.clear()`
   - Press Enter
   - Refresh page

2. **Try logging in:**
   - Go to http://localhost:3000/login
   - Enter your real email address
   - Click "Login"
   - **Check your email** (including spam folder)
   - You should receive a 6-digit code from InstantDB

3. **Enter verification code:**
   - After clicking Login, you'll be redirected to `/verify`
   - Enter the 6-digit code
   - Click "Verify & Continue"

4. **Start trading:**
   - You'll have €10,000 starting balance
   - All data saved to InstantDB
   - Visible in your dashboard!

### Troubleshooting Magic Code:

**If email doesn't arrive:**
1. Check spam/junk folder
2. Wait 1-2 minutes (sometimes delayed)
3. Try with a different email provider (Gmail usually works best)

**If verification fails:**
1. Make sure code is exactly 6 digits
2. Try resending (go back to /login and try again)
3. Check InstantDB dashboard for error logs

---

## Option 2: Simple Demo → Real Data Migration

If you want to keep your demo data and move it to InstantDB:

### Manual approach:
1. Go to InstantDB dashboard: https://www.instantdb.com/dash
2. Select your app
3. Go to "Explorer" or "Data" tab
4. Manually create your user and trades

### Automatic approach (I can build this):
I can create a "Migrate to InstantDB" button that:
- Takes your demo mode data
- Creates it in InstantDB
- Keeps all your trades and positions

**Want me to build this?**

---

## Option 3: Skip Auth Entirely (Single User Mode)

If you're the only user and just want to store data in InstantDB:

I can modify the app to:
- Auto-create a single user on first load
- Skip login screens entirely
- All data goes to InstantDB automatically
- No authentication needed

This is perfect for personal use!

**Want me to implement this?**

---

## What I Recommend:

### For Testing Right Now:
**Try Option 1 (Magic Code)**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Go to /login
4. Enter your email
5. Check email for code

### For Production/Easy Use:
**Option 3 (Single User, No Auth)**
- Simplest for your use case
- All data in InstantDB
- No login hassle
- I can implement in 5 minutes

---

## Quick Commands to Clear Demo Mode:

In browser console (F12):
```javascript
// Clear demo mode
localStorage.removeItem('demoMode');
localStorage.removeItem('demoUser');
localStorage.removeItem('demoData');

// Or clear everything
localStorage.clear();

// Then refresh page
location.reload();
```

---

## Which option do you prefer?

1. **Try Magic Code** - Most "proper" auth
2. **Skip Auth** - Simplest, I implement single-user mode
3. **Migrate Demo Data** - Keep your trades, move to InstantDB

Pasakykite, kurį variantą norite! 🚀

