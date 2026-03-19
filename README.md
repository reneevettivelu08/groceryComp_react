# groceryComp_react

React frontend for the groceryComp price comparison tool. Lets you manually enter your weekly Odd Bunch delivery, then compares each item's price against No Frills, Loblaws, and Real Canadian Superstore using live data from the Express backend.

---

## What it does

- **Weekly menu entry** — enter your Odd Bunch box contents (item, weight, unit, country of origin), saved to localStorage so they persist between sessions
- **Price comparison** — for each item, fetches real-time grocery store prices via the Express backend and displays them side by side with per-kg/lb breakdowns
- **Savings summary** — calculates an estimated total for each store and shows how much you save (or don't) vs the Odd Bunch subscription price
- **Store settings** — toggle which stores to compare against and set your nearest store location by ID

---

## Tech stack

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | React JSX support for Vite |

No UI library dependencies — all components are built with plain React and inline styles.

---

## Project structure

```
groceryComp_react/
├── index.html
├── vite.config.js              # Dev proxy: /api → localhost:3001
├── package.json
└── src/
    ├── main.jsx                # React entry point
    ├── index.css               # Global reset and body styles
    ├── App.jsx                 # Top-level nav and view switching
    └── components/
        ├── OddBunchEntry.jsx   # Manual delivery entry form
        ├── PriceComparison.jsx # Side-by-side price comparison view
        └── StoreSelector.jsx   # Store enable/disable and ID settings
```

---

## Local setup

### Prerequisites

- Node.js v18 or higher — https://nodejs.org
- The Express backend running at `http://localhost:3001`

### Install

```bash
git clone https://github.com/reneevettivelu08/groceryComp_react.git
cd groceryComp_react
npm install
```

### Run

```bash
npm run dev
```

App starts at `http://localhost:5173`.

The `vite.config.js` proxies all `/api/*` requests to `http://localhost:3001` automatically, so you never need to hardcode the backend URL in development.

> Make sure the Express backend is running first or API calls will fail silently.

---

## How to use

### 1. Enter your weekly menu

Go to **Weekly menu** and fill in this week's Odd Bunch delivery:

- **Delivery date** — the date your box arrives
- **Box size** — determines the Odd Bunch subscription price used in the totals
- **Items** — add each item with its weight and unit (grams, kg, lbs, oz)
- Country of origin is optional but pulled from the Odd Bunch website if you want to track it

Click **Save menu**. Menus are saved to your browser's localStorage and persist across sessions.

### 2. Configure stores

Go to **Store settings** and:

- Toggle on/off which stores to compare against
- Select your nearest store from the Hamilton, ON presets, or enter a custom store ID

**Finding your store ID:** Browse to nofrills.ca, open DevTools (F12) → Network → filter XHR, search for something, and look for `storeId` in any request to `api.pcexpress.ca`.

### 3. Add product codes for your items

The backend uses product codes (not search terms) to look up prices reliably. Before comparing, you need to add a code for each item.

**Finding a product code:**
1. Go to [nofrills.ca](https://www.nofrills.ca) and search for your item
2. Click the product
3. Copy the code from the URL: `.../bananas-bunch/p/20175355001_KG` → `20175355001_KG`

**Adding via the backend API** (run this in your terminal):
```bash
curl -X POST http://localhost:3001/api/loblaw/codes \
  -H "Content-Type: application/json" \
  -d '{ "term": "bananas", "codes": ["20175355001_KG"] }'
```

Or edit `server/productCodes.json` directly and restart the Express server.

The `term` should loosely match the Odd Bunch item name — the backend does partial matching, so `"kale"` will match `"Fresh Kale Slaw"`.

### 4. Compare prices

From the **Weekly menu** tab, click **Compare prices →** on any saved menu. The comparison view will:

- Fire one API request per item per store
- Display the store price, per-kg/lb breakdown, and an estimated equivalent cost for your Odd Bunch quantity
- Show a **totals row** at the bottom comparing your Odd Bunch box price vs what the same items would cost at each store

Click **▼ alternatives** on any item row to see other matched products and switch which one is used in the comparison.

---

## Environment variables

In development, no environment variables are needed — the Vite proxy handles routing to the backend.

In production (Netlify), set this in your Netlify dashboard under **Site settings → Environment variables**:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of your deployed Express backend e.g. `https://grocerycomp-api.herokuapp.com` |

---

## Build for production

```bash
npm run build
```

Output goes to `dist/`. This is what Netlify deploys.

---

## Deployment (Netlify + Heroku)

See the full step-by-step deployment guide below. The short version:

1. Deploy the Express backend to Heroku first
2. Copy the Heroku app URL
3. Set `VITE_API_URL` in Netlify to that URL
4. Deploy the React frontend to Netlify

The `netlify.toml` in the root of this repo handles the build command, publish directory, and SPA routing fallback automatically.