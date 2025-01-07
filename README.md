# Expense Tracker Pro

A modern, AI-powered expense tracking application built with Next.js 14, React, and TypeScript. Features intelligent subscription management, receipt scanning, and financial insights.

![Expense Tracker Pro](./docs/assets/preview.png)

## 🌟 Features

### 💰 Core Features
- **Expense Tracking**
  - Automatic categorization
  - Receipt scanning & OCR
  - Multiple currency support
  - Custom categories & tags
  - Recurring expenses

### 📊 Analytics & Insights
- **Financial Dashboard**
  - Monthly spending trends
  - Category breakdowns
  - Budget tracking
  - Custom reports
  - Export capabilities

### 🤖 AI-Powered Features
- **Smart Categorization**
  - ML-based expense categorization
  - Pattern recognition
  - Automated tagging
  - Anomaly detection

- **Subscription Management**
  - Automatic subscription detection
  - Renewal tracking
  - Cost optimization suggestions
  - Alternative service recommendations

### 📱 User Experience
- **Modern UI/UX**
  - Responsive design
  - Dark/light mode
  - Real-time updates
  - Interactive charts
  - Drag & drop interface

## 🛠 Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Chart.js
- React Query

### Backend & Services
- Supabase
- OpenAI API
- Mindee (Receipt OCR)
- Teller (Banking)
- Cloudflare R2 (Storage)

### Development
- ESLint
- TypeScript
- Prettier
- Husky
- Jest

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Fill in your environment variables:
\`\`\`env
# See .env.example for all required variables
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
expense-tracker/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   └── views/          # Page-specific components
│   ├── lib/
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Business logic & services
│   │   └── utils/          # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── docs/                  # Documentation
\`\`\`

## 🔒 Security

- Environment variables are encrypted
- Sensitive data is handled securely
- API keys are properly managed
- Regular security audits
- See [SECURITY.md](./docs/SECURITY.md) for details

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Component Documentation](./docs/components.md)
- [API Documentation](./docs/api.md)
- [Security Guide](./docs/SECURITY.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- [OpenAI](https://openai.com/) for AI features
- [Mindee](https://mindee.com/) for receipt parsing
- [Teller](https://teller.io/) for banking integration
- [Supabase](https://supabase.com/) for backend services
