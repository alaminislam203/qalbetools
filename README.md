# QalbeTools - Developer API Suite

QalbeTools is a powerful, free, and open-source developer API suite for device mockups, social media media extraction, and AI-powered text processing.

## 🚀 Getting Started

1.  **Clone the Repo**: `git clone https://github.com/alaminislam203/qalbetools`
2.  **Install Dependencies**: `npm install`
3.  **Setup Environment**: Create a `.env.local` file with your Firebase credentials.
4.  **Run Development**: `npm run dev`

## 🔑 Membership & API Authentication

QalbeTools now supports a membership-based API token system.

### How to get an API Token:
1.  Sign in to the [QalbeTools Dashboard](https://tools.qalbetalks.com/dashboard).
2.  Users with a **Pro Plan** will automatically have an API token generated.
3.  Copy your token from the "Developer API" section.

### Using the API:
All API requests must include the `x-api-token` header:

```bash
curl -X POST https://tools.qalbetalks.com/api/fb-downloader \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_SECRET_TOKEN" \
  -d '{"url": "https://www.facebook.com/reel/..."}'
```

## 🛠️ Available APIs

- **Mockup API**: `/api/mockup` (POST)
- **Facebook API**: `/api/fb-downloader` (POST)
- **Instagram API**: `/api/ig-downloader` (POST)
- **TikTok API**: `/api/tiktok-downloader` (POST)
- **Grammar AI**: `/api/grammar-checker` (POST - Pro)
- **Article Rewriter**: `/api/article-rewriter` (POST - Pro)
- **Shortener**: `/api/url-shortener` (POST)

## ⚠️ Service Maintenance

> [!WARNING]
> **YouTube Downloader**: The YouTube downloader API and tool are currently **SHUT DOWN** for maintenance. Please use our Facebook or TikTok tools in the meantime.

## 📄 Documentation

For detailed implementation examples, please refer to the [API Guide](https://tools.qalbetalks.com/#api-docs).

---
Built with ❤️ by [QalbeTalks](https://qalbetalks.com)
