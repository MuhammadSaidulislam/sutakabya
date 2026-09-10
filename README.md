# MomAndChild Admin Dashboard

A responsive admin dashboard for the MomAndChild baby & maternity e-commerce store, built with Next.js (App Router), TypeScript, Tailwind CSS v4, and Recharts.

## Features

- **Dashboard** — revenue, orders, customers, and restock stats, plus a revenue trend chart, category sales donut, weekly visitor traffic, recent orders, and a low-stock list.
- **Products** — add/edit/delete, search, filter by category & stock status, **multi-image upload with thumbnail selection** (pick which uploaded photo shows in listings), auto stock-status logic.
- **Categories** — card grid of product categories with add / edit / delete.
- **Orders** — search/filter, a detail panel with the full item breakdown (each order can hold many line items), inline status updates (Processing → Shipped → Delivered → Cancelled), and an **invoice view with PDF download**.
- **Delivery** — shipment tracking cards with courier, ETA, progress bar, and status updates (Preparing → In Transit → Out for Delivery → Delivered / Delayed).
- **Customers** — every customer is uniquely identified by mobile number; each customer card links to their full order history, since one customer can place many orders and each order can contain many items. Order rows on the Orders page link straight to the matching customer.
- **Reviews** — moderate product reviews by rating and status (Published / Pending / Hidden).
- **Coupons** — percentage or fixed-amount discount codes with usage limits, min. order, and validity windows.
- **Campaigns** — marketing campaigns across email, SMS, social, and storefront banners, with reach and discount tracking.
- **Settings** — basic store information form.
- Fully responsive: collapsible sidebar on mobile/tablet, fixed sidebar on desktop.

All data is mock data held in React state (`lib/data.ts`) so every add/edit/delete works live in the browser — wire it up to your real backend/API by replacing the state calls in each page with API requests. Uploaded product images are held as data URLs in memory for the demo; swap in real file storage (S3, Cloudinary, etc.) for production.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm run start
```

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** for the charts
- **jsPDF** + **jspdf-autotable** for invoice PDF generation
- **lucide-react** for icons
- **@fontsource/fredoka** + **@fontsource/inter** for self-hosted fonts (no external font requests at build/runtime)

## Project structure

```
app/
  page.tsx              -> Dashboard
  products/page.tsx     -> Products (multi-image upload + thumbnail)
  categories/page.tsx   -> Categories
  orders/page.tsx       -> Orders (line items + invoice)
  delivery/page.tsx     -> Delivery tracking
  customers/page.tsx    -> Customers (mobile-unique, order history)
  reviews/page.tsx      -> Product reviews moderation
  coupons/page.tsx      -> Coupons
  campaigns/page.tsx    -> Marketing campaigns
  settings/page.tsx     -> Store settings
components/
  AppShell.tsx, Sidebar.tsx, Topbar.tsx                            -> layout shell
  StatCard.tsx, StatusPill.tsx, PageHeader.tsx, ProductThumb.tsx    -> shared UI
  ProductModal.tsx, ImageUploader.tsx, ConfirmDialog.tsx, InvoiceModal.tsx -> forms/dialogs
  charts/                                                          -> Recharts components
lib/data.ts             -> mock data (products, categories, customers, orders, deliveries, reviews, coupons, campaigns, chart data)
```
