# Furnitures

Modern furniture storefront built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui.

## Overview

This project showcases a furniture catalog with a marketing site, product browsing, and admin tools.

Key features:

- Brand-based product filtering
- Product pagination
- Cloudinary-backed image storage and delivery
- Background removal and transparent image delivery
- Brand-specific watermark handling
- Admin product and brand management
- Contact and about pages with a consistent storefront layout

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Cloudinary
- sharp

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run Biome checks
- `npm run format` - format the codebase with Biome

## Environment Variables

Cloudinary is required for image upload and image processing features.

Set these variables in your environment:

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

If these are missing, Cloudinary upload and derived image features will not work.

## Project Structure

```text
src/
  app/        Next.js routes and pages
  components/ Reusable UI and custom storefront components
  lib/        Shared helpers for products, Cloudinary, caching, and utilities
data/         JSON-backed content stores used by the app
public/       Static assets, including brand logos
```

## Main Pages

- `/` - storefront home page
- `/about` - brand story and values
- `/contact` - contact page
- `/collections` - product browsing page
- `/admin` - admin dashboard

## Notes

- Product data is backed by JSON files in `data/`.
- Legacy images can be migrated to Cloudinary through the existing product management flow.
- Images displayed in the storefront are routed through the app to keep the UI consistent and support watermarking/background removal.
