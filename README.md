# Crypto Dashboard

A React + TypeScript dashboard for market signals, macro data, and a news section that can refresh automatically.

## Local development

```bash
npm install
npm run dev
```

The app serves the Vite frontend and the API endpoints from the local Express server.

## Auto-updating news

The news section is now backed by a refresh script that pulls a public RSS feed and writes a fresh snapshot into [data/snapshot.json](data/snapshot.json).

```bash
npm run refresh:news
```

The dashboard also auto-refreshes the snapshot every 15 minutes in the browser.

## GitHub + Vercel deployment

This repository includes a GitHub workflow for refreshing the news snapshot on a schedule.

If Vercel is already connected to the GitHub repository, pushing to the main branch is enough for automatic deployment.
