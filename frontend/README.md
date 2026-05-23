# SUNDAY BAZAR 🛍️

A modern classifieds portal inspired by OLX — built for Pakistan and South Asia. Browse, search, filter, and post product listings with Firebase authentication.

## Tech Stack

- **Next.js** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Firebase** — Authentication & Firestore database
- **DummyJSON API** — Product data

## Features

- Browse 100+ product listings
- Filter by category, city, and search text
- Google & Email authentication
- Post your own product ads
- Save favorites (persisted in localStorage)
- Bargaining chat with sellers
- Fully responsive design

## Run Locally

**Prerequisites:** Node.js

1. Clone the repo:
   ```
   git clone https://github.com/muhammadnomankhan482/sunday-bazar.git
   cd sunday-bazar/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the dev server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app router
│   ├── components/   # UI components
│   └── lib/          # Firebase config
├── next.config.js
└── package.json
```

## Deployment

Deployed on **Vercel** — [sunday-bazar.vercel.app](https://sunday-bazar.vercel.app)
