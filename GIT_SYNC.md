# CineTrack Dual-GitHub & Vercel Deployment Guide

This guide documents how the CineTrack codebase is managed locally, how it is deployed to GitHub across two accounts simultaneously, and how Vercel hosting is configured.

---

## 1. Repositories Overview

| Target | Repository URL | Purpose |
|---|---|---|
| **Main Account** | `https://github.com/FahadIslam09/cinetrack.git` | Primary source code and repository showcase. |
| **Vercel Account** | `https://github.com/fahadislamfi99-cloud/cinetrack.git` | Secondary contributor account used to deploy on Vercel Hobby plan. |

---

## 2. Directory Architecture

- **Local Workspace (`watch-list/`)**:
  - `cinetrack/`: The complete Next.js 15 application (`package.json`, `src/`, `public/`, etc.).
  - Mockups, design documentation, and PRD files stay local in `watch-list/` and are excluded from GitHub.
- **GitHub Repositories (`cinetrack`)**:
  - Contains **only** the contents of the `cinetrack/` folder directly at the root (`package.json`, `src/`, `public/`, `tsconfig.json`).
  - Allows Vercel to automatically recognize and build Next.js with **zero** custom root directory settings.

---

## 3. Dual-Push Configuration

The local `origin` remote is configured with **two push URLs**:

```bash
# Verify current push remotes:
git remote -v
```

Output:
```text
origin  https://github.com/FahadIslam09/cinetrack.git (fetch)
origin  https://github.com/FahadIslam09/cinetrack.git (push)
origin  https://github.com/fahadislamfi99-cloud/cinetrack.git (push)
```

Whenever you push to `origin`, Git pushes to **both accounts in sequence**.

---

## 4. How to Push Code Updates to Both Accounts

### Standard 2-Step Workflow

#### Step 1: Stage and commit your changes locally
```bash
git add .
git commit -m "feat: your commit message"
```

#### Step 2: Push the `cinetrack/` project directly to both GitHub repositories
Run this command from the repository root:
```bash
git subtree split --prefix=cinetrack -b deploy-tmp && git push origin deploy-tmp:main && git branch -D deploy-tmp
```

---

## 5. One-Word Shortcut Setup (`git push-both`)

To avoid typing the full subtree command every time, set up this Git alias once:

```bash
git config alias.push-both "!git subtree split --prefix=cinetrack -b _deploy_tmp && git push origin _deploy_tmp:main && git branch -D _deploy_tmp"
```

### Daily Workflow With Shortcut:
```bash
# 1. Commit your changes
git add .
git commit -m "feat: add awesome feature"

# 2. Push to both GitHub accounts instantly
git push-both
```

---

## 6. Vercel Deployment Setup

1. **Log in to Vercel** using your secondary GitHub account: **`fahadislamfi99-cloud`**.
2. Click **"Add New..."** → **"Project"**.
3. Import **`fahadislamfi99-cloud/cinetrack`**.
4. **Configure Project**:
   - **Framework Preset**: Next.js (Auto-detected).
   - **Root Directory**: `./` (Leave as default — `package.json` is at the root).
   - **Build Command**: `next build` (Default).
   - **Output Directory**: `.next` (Default).
5. **Environment Variables**:
   Copy the keys and values from `cinetrack/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `TMDB_API_READ_ACCESS_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (Set to your production domain or Vercel URL)
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `IMGBB_API_KEY`
6. Click **Deploy**.
   Every future `git push-both` will automatically trigger a new production build on Vercel!
