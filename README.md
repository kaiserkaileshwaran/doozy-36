# DOOZY

Online storefront and admin dashboard for DOOZY, a churidar atelier based in India. Built with Next.js, React, Tailwind CSS and Firebase Realtime Database.

## Features

- Product catalogue, wishlist, bag and checkout
- Order tracking and customer accounts
- Shorts: vertical video reels on the home page, one plays at a time
- Admin dashboard for products, offers, orders, reviews, branches and content
- Web push notifications for new launches, new offers and items left in the bag

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site runs on http://localhost:3000.

### Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public key used by browsers to subscribe to push |
| `VAPID_PRIVATE_KEY` | Private key used by the server to send push |
| `VAPID_CONTACT` | Contact address sent with push messages (`mailto:`) |
| `CRON_SECRET` | Optional. Protects the cart reminder endpoint |

Generate a key pair with:

```bash
npx web-push generate-vapid-keys
```

## Push notifications

- Customers are asked once, through an in-page prompt, before the browser permission dialog appears.
- Saving a new product or an active offer in the admin dashboard calls `POST /api/push/broadcast`.
- `GET /api/push/cart-reminders` nudges customers whose bag has been idle for 3 hours. `vercel.json` runs it once a day.
- Subscriptions are stored under `doozy_push/subscriptions` in the database. Expired ones are removed automatically.

Push needs HTTPS, so test on `localhost` or the deployed site.

## Deploying

1. Push the repository to GitHub and import it in Vercel.
2. Add the environment variables above in the Vercel project settings.
3. Publish `database.rules.json` from the Firebase console, or with `firebase deploy --only database`.

## Project layout

```
public/            static files, logos and the push service worker
src/app/           routes and API handlers
src/components/    admin, customer and shared UI
src/context/       store state and Firebase sync
src/lib/           Firebase setup and push helpers
src/data/          static reference data
src/types/         shared types
```
