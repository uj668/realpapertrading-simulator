# 🚀 Step-by-Step Deployment Guide (No Experience Needed!)

## ✅ What You'll Need:
- ✅ Your email: jurgaityte.urte@gmail.com
- ✅ About 15 minutes
- ✅ This guide!

---

## 📋 **STEP 1: Create GitHub Account**

### 1.1: Go to GitHub
Open browser and go to: **https://github.com/signup**

### 1.2: Fill in the form:
1. **Email address:** `jurgaityte.urte@gmail.com`
2. **Password:** Choose a strong password (save it somewhere!)
3. **Username:** Choose any username (e.g., `jurgaityte`, `urtejuu`, etc.)
4. Click **Continue**

### 1.3: Verify your email
1. GitHub will send you a code to your email
2. Check your email (including spam folder)
3. Enter the code
4. Click **Continue**

### 1.4: Complete setup
1. You can skip the personalization questions (or answer them)
2. Choose **Free** plan
3. Click **Complete setup**

✅ **GitHub account created!**

---

## 📋 **STEP 2: Create Your Repository**

### 2.1: Create new repository
1. In GitHub, click the **+** icon (top right)
2. Click **New repository**

### 2.2: Fill in repository details:
- **Repository name:** `realpapertrading-simulator`
- **Description:** `Stock trading simulator with real-time prices`
- **Visibility:** Choose **Public** (so anyone can see the code)
- **Important:** Do NOT check any boxes below!
  - ❌ Don't add README
  - ❌ Don't add .gitignore
  - ❌ Don't add license
- Click **Create repository**

### 2.3: Copy the repository URL
You'll see a screen with commands. **Keep this tab open!**

The URL will look like:
```
https://github.com/YOUR_USERNAME/realpapertrading-simulator.git
```

✅ **Repository created! Keep this tab open.**

---

## 📋 **STEP 3: Upload Code to GitHub**

### 3.1: Open Terminal on your Mac
- Press `Cmd + Space`
- Type "Terminal"
- Press Enter

### 3.2: Navigate to your project
Copy and paste this command (press Enter):
```bash
cd "/Users/urtej/Dropbox/Cursor-Paper Trading Company"
```

### 3.3: Initialize Git
Copy and paste these commands one by one:

```bash
git init
```
*This creates a new git repository*

```bash
git add .
```
*This adds all your files*

```bash
git commit -m "Initial commit: RealPaperTrading Simulator"
```
*This saves your files*

### 3.4: Connect to GitHub
**Replace YOUR_USERNAME with your actual GitHub username!**

```bash
git remote add origin https://github.com/YOUR_USERNAME/realpapertrading-simulator.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

**When prompted:**
- Username: Your GitHub username
- Password: **Use Personal Access Token (see below)**

### 3.5: GitHub Personal Access Token (First time only)

Since password authentication doesn't work anymore, you need a token:

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Note: `Vercel Deployment`
4. Expiration: `90 days` (or No expiration)
5. Select scopes: Check ✅ **repo** (all boxes under repo)
6. Click **Generate token**
7. **COPY THE TOKEN** (you won't see it again!)
8. Use this token as your password when pushing

✅ **Code uploaded to GitHub!**

---

## 📋 **STEP 4: Deploy to Vercel**

### 4.1: Create Vercel Account
1. Go to: **https://vercel.com/signup**
2. Click **Continue with GitHub**
3. Sign in to GitHub if prompted
4. Click **Authorize Vercel**

✅ **Vercel account created!**

### 4.2: Import Your Project
1. In Vercel dashboard, click **Add New...** → **Project**
2. You'll see a list of your GitHub repositories
3. Find **realpapertrading-simulator**
4. Click **Import** next to it

### 4.3: Configure Project
Vercel will automatically detect Next.js.

**Important: Add Environment Variables!**

1. Scroll down to **Environment Variables** section
2. Click to expand it
3. Add these **2 variables**:

**Variable 1:**
- Click **Environment Variables**
- Key: `NEXT_PUBLIC_TWELVE_DATA_API_KEY`
- Value: `6d8e110e8f884e4782c3af257e57f7df`
- Click **Add**

**Variable 2:**
- Key: `NEXT_PUBLIC_INSTANT_APP_ID`
- Value: `959b5976-79ee-4df6-83f4-2834e81a390e`
- Click **Add**

### 4.4: Deploy!
1. Everything else can stay as default
2. Click **Deploy** button
3. Wait 2-3 minutes...

You'll see:
- ⏳ "Building..." (1-2 minutes)
- ⏳ "Deploying..." (30 seconds)
- 🎉 "Congratulations!" 

✅ **App is LIVE!**

---

## 📋 **STEP 5: Get Your Live URL**

After deployment completes:

1. You'll see a big **"Congratulations"** screen
2. There will be a preview image of your site
3. Click **Visit** button or copy the URL

Your URL will be:
```
https://realpapertrading-simulator.vercel.app
```
or
```
https://realpapertrading-simulator-YOUR_USERNAME.vercel.app
```

✅ **Your app is now PUBLIC and anyone can use it!**

---

## 🎉 **TEST YOUR LIVE APP**

### Test 1: Sign Up
1. Go to your Vercel URL
2. Click **Sign Up**
3. Enter a test email
4. Check email for magic code
5. Enter code → Create account

### Test 2: Trade
1. Go to **Trade** page
2. Enter **AAPL**
3. Amount: **€500**
4. Click **Buy**
5. Check that trade appears in Recent Trades

### Test 3: Portfolio
1. Go to **Portfolio** page
2. See your AAPL position
3. Check cash decreased to €9,500

### Test 4: History
1. Go to **History** page
2. See your trade in the table
3. See charts

✅ **Everything works!**

---

## 📤 **SHARE WITH OTHERS**

Now you can share your URL with anyone:

```
https://realpapertrading-simulator.vercel.app
```

They can:
- ✅ Sign up with their own email
- ✅ Get their own €10,000 starting balance
- ✅ Trade stocks independently
- ✅ Track their own portfolio
- ✅ View their own history

**Each user has their own separate account and data!**

---

## 🔄 **UPDATE YOUR APP LATER**

If you make changes to the code:

```bash
cd "/Users/urtej/Dropbox/Cursor-Paper Trading Company"
git add .
git commit -m "Description of what you changed"
git push
```

Vercel will **automatically redeploy** in ~2 minutes! 🚀

---

## 🆘 **TROUBLESHOOTING**

### Problem: "git push" asks for password
**Solution:** Use Personal Access Token (see step 3.5)

### Problem: Magic codes not arriving
**Solution:** 
- Check spam folder
- Wait 1-2 minutes
- Try different email provider

### Problem: Vercel build fails
**Solution:**
- Check that both environment variables are added
- Make sure there are no typos in the values
- Check build logs in Vercel dashboard

### Problem: Can't find repository in Vercel
**Solution:**
- Click "Adjust GitHub App Permissions"
- Make sure Vercel can access your repository

---

## ✅ **FINAL CHECKLIST**

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_TWELVE_DATA_API_KEY
  - [ ] NEXT_PUBLIC_INSTANT_APP_ID
- [ ] App deployed successfully
- [ ] Tested sign up/login
- [ ] Tested trading
- [ ] URL shared with others

---

## 🎯 **YOU'RE DONE!**

Your app is now:
- ✅ Live on the internet
- ✅ Accessible by anyone
- ✅ Using real-time stock prices
- ✅ Saving data to InstantDB
- ✅ Supporting multiple users
- ✅ Automatically updating when you push changes

**Congratulations! 🎉🚀**

