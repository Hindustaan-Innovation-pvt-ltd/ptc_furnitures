# PTC Furnitures Storefront & Operations Portal

Modern furniture storefront and business management platform built with React 19, Next.js 16 (App Router), Tailwind CSS 4, MongoDB, and Sharp.

> [!IMPORTANT]
> For comprehensive details on system navigation, database collections, operations, and step-by-step guides, please refer directly to the **[DOCUMENTATION.md](DOCUMENTATION.md)** file.

---

## 🛠️ Tech Stack Overview

- **Frontend:** Next.js 16 App Router (Partial Prerendering enabled), React 19, Tailwind CSS v4, shadcn/ui
- **Backend/Database:** Node.js standalone runtime, MongoDB 8.0 (via Mongoose 9.6)
- **Integrations:** Sharp (background removal & watermark scaling), Meta WhatsApp Business APIs, MSG91 SMS

---

## ⚙️ Environment Configuration

Set these variables in a `.env` file in the root directory:

```bash
# Database URI
MONGODB_URI=mongodb://127.0.0.1:27017/furnitures

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-JGB09E5S7F

# MSG91 SMS Config
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id
MSG91_SENDER=your_msg91_approved_sender

# Admin SMS Alerts Target
ADMIN_SMS_RECIPIENT=+91XXXXXXXXXX

# Meta WhatsApp Business API Config
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_token
```

---

## 🏃 Getting Started

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
3. **Check Code Quality (Biome):**
   ```bash
   npm run lint
   npm run format
   ```

### Docker Deployment

Run the complete platform stack (Next.js server + MongoDB database) in the background with persistent volumes mapped for catalog images and backups:

```bash
docker compose up -d --build
```

---

## 🧹 Maintenance Scripts

- **Asset Ingestion & Re-watermarking:** Migrate legacy image URLs and Base64 buffers to WebP disk files under `/public/upload/`:
  ```bash
  npx tsx scripts/migrate-images.ts
  ```
- **Database Backup Export:** Back up the MongoDB products collection locally:
  ```bash
  npx tsx scripts/export-db.ts
  ```
