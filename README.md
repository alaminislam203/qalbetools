# QalbeTools — Developer API Suite

QalbeTools is a powerful, open-source developer API suite for device mockups, social media extraction, and AI-powered text processing. All API endpoints are **Pro-only** and require a valid API token.

---

## 🚀 Getting Started

1. **Clone the Repo**: `git clone https://github.com/alaminislam203/qalbetools`
2. **Install Dependencies**: `npm install`
3. **Setup Environment**: Create a `.env.local` file with your Firebase credentials.
4. **Run Development**: `npm run dev`

---

## 🔑 Authentication — API Token System

All API endpoints require a valid **Pro Plan** API token.

### Step 1: Get Your Token
1. Sign in at [tools.qalbetalks.com/dashboard](https://tools.qalbetalks.com/dashboard)
2. Upgrade to **Plus** or **Pro** plan.
3. Copy your token from the **"Developer API Token"** section.

### Step 2: Include the Token in Every Request
Pass your token as a custom HTTP header in every API call:

```
x-api-token: YOUR_SECRET_TOKEN
```

### Example — cURL
```bash
curl -X POST https://tools.qalbetalks.com/api/fb-downloader \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_SECRET_TOKEN" \
  -d '{"url": "https://www.facebook.com/reel/..."}'
```

### Example — JavaScript (fetch)
```javascript
const response = await fetch('https://tools.qalbetalks.com/api/grammar-checker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-token': 'YOUR_SECRET_TOKEN'      // <-- Required
  },
  body: JSON.stringify({ text: 'Your text here.' })
});

const data = await response.json();
console.log(data);
```

### Example — Python (requests)
```python
import requests

headers = {
    'Content-Type': 'application/json',
    'x-api-token': 'YOUR_SECRET_TOKEN'      # <-- Required
}

response = requests.post(
    'https://tools.qalbetalks.com/api/ig-downloader',
    json={'url': 'https://www.instagram.com/reel/...'},
    headers=headers
)
print(response.json())
```

---

## 🛠️ Available API Endpoints

All endpoints are at `https://tools.qalbetalks.com/api/`

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/api/fb-downloader` | POST | `{ url }` | Download Facebook videos (HD/SD) |
| `/api/ig-downloader` | POST | `{ url }` | Download Instagram reels & images |
| `/api/tiktok-downloader` | POST | `{ url }` | Download TikTok videos (No Watermark) |
| `/api/grammar-checker` | POST | `{ text }` | AI-powered grammar correction |
| `/api/article-rewriter` | POST | `{ text, tone, length }` | AI article rewriter |
| `/api/resume-ai` | POST | `{ action, ...fields }` | AI resume builder & ATS scorer |
| `/api/url-shortener` | POST | `{ url }` | URL shortener + QR code |
| `/api/mockup` | POST | `FormData { image, deviceId }` | Device mockup generator |

---

## 📋 Response Format

All endpoints return a consistent JSON response:

```json
// Success
{ "success": true, "data": { ... } }

// Error / Unauthorized
{ "success": false, "error": "API token is required in x-api-token header" }
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad Request (invalid input) |
| `401` | Unauthorized (missing or invalid token) |
| `503` | Service Unavailable (temporary shutdown) |

---

## 💳 Subscription Plans

| Plan | Price | Daily Limit |
|---|---|---|
| **Hobbyist** | Free | 20 requests/day |
| **Plus** | $10/month | 100 requests/day |
| **Pro Developer** | $30/month | 500 requests/day |
| **Enterprise** | Custom | Unlimited |

---

## ⚠️ Service Status

> [!WARNING]
> **YouTube Downloader** is currently **SHUT DOWN** for maintenance. Use Facebook or TikTok tools in the meantime.

---

Built with ❤️ by [QalbeTalks](https://qalbetalks.com)
