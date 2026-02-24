# 🚀 Carelinq Deployment Guide

Your production build is ready! Follow these steps to get your medical portal live on the internet.

## Option 1: Vercel (Fastest & Recommended)
Vercel is perfect for Vite/React apps.

1. **Install Vercel CLI**:
   ```powershell
   npm i -g vercel
   ```
2. **Deploy**:
   Run this command in the `frontend/AI-Scribe` terminal:
   ```powershell
   vercel
   ```
3. **Follow Prompts**:
   - Log in if required.
   - Say **Yes** to "Set up and deploy?".
   - Use the default settings (it will detect Vite).
4. **Result**: You will get a unique URL (e.g., `carelinq-seven.vercel.app`).

## Option 2: Netlify (Drag & Drop)
If you don't want to use the command line:

1. Go to [Netlify](https://app.netlify.com/).
2. Log in.
3. Find the **"Drag and drop your site folder"** section.
4. Drag the `frontend/AI-Scribe/dist` folder into your browser.
5. **Result**: Your site is live instantly!

## Option 3: GitHub Pages
1. Create a new repository on GitHub.
2. Push your code:
   ```powershell
   git add .
   ```
3. Connect the repo to Vercel/Netlify for automatic updates every time you save.

---

### 🚨 Important Note on Real-Time Features
- **Video (Jitsi)**: Works automatically on any URL.
- **Chat (Gun.js)**: Uses global relay peers. It will work perfectly as soon as the site is live. 

**Building again?**
If you make changes, always run:
```powershell
npm run build
```
before deploying!
