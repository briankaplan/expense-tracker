# Expense Tracker

A modern expense tracking application with receipt matching and automated bank sync.

## Features

- 📱 Mobile-friendly design with light/dark mode
- 🏦 Bank integration via Teller API
- 📸 Receipt capture and OCR via Mindee
- 📧 Gmail plugin for automated receipt matching
- 📱 SMS receipt capture via Apple Shortcuts
- 🤖 AI-powered categorization via ChatGPT
- ☁️ Cloud backup to Dropbox

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Firebase Auth & Database
- Teller API for bank sync
- Mindee OCR
- ChatGPT API
- Dropbox API

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Project Structure

```
src/
  ├── components/
  │   ├── ui/          # Base UI components
  │   ├── providers/   # App providers
  │   └── views/       # Feature components
  │       ├── dashboard/
  │       ├── expenses/
  │       ├── reports/
  │       └── receipts/
  └── lib/
      ├── services/    # External API integrations
      └── hooks/       # Custom React hooks
```

## License

MIT
