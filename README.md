# ✨ DivyaDhan (दिव्य धन)

> **Brilliant Personal Wealth Management & Financial Command Center**

DivyaDhan is a premium, self-hosted Personal Financial Operating System. It aggregates all aspects of personal finance—accounts, tracking, wealth modules, and goal planning—combined with an advanced AI Advisor powered by Google Gemini.

---

## 🌟 Key Features

*   **Consolidated Dashboard:** Real-time visibility into your Net Worth, Cash Flow trends, Savings Rates, and Financial Health diagnostics.
*   **Wealth & Portfolios:** Track stocks, mutual funds, gold, fixed deposits, bonds, and crypto portfolios with real-time profit/loss metrics.
*   **Smart Accounts:** Manage liquidity across bank accounts, wallets, physical lockers, and emergency funds.
*   **Lending & Borrowing Logs:** Register loans given or taken, record repayment installments, and track balances.
*   **AI Financial Advisor:** Contextual conversational support powered by Gemini to answer complex questions about your real-time portfolio.
*   **Smart Bank Statement Analyzer:** Drag and drop PDF or CSV statements to automatically parse transactions, clean merchant names, and categorize spending categories.
*   **Financial Journal & Notes:** Sticky financial notes sorted by categories (tax logs, investment rules, general journaling).
*   **Subscriptions Manager:** Track active recurring renewals and get ahead of payment due dates.

---

## 🛠 Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
*   **Database:** [MongoDB](https://www.mongodb.com/) via [Prisma ORM](https://www.prisma.io/)
*   **Authentication:** [NextAuth.js v5](https://nextjs.org/docs/app/building-your-application/authentication) (Credentials + Google OAuth)
*   **AI Models:** [Google Gemini API via @google/genai SDK](https://ai.google.dev/)
*   **UI/UX:** HSL color variables (Harmonious Light/Dark mode), Tailwind CSS, Lucide Icons, Framer Motion animations
*   **Charts:** Recharts

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have [Node.js (v20+)](https://nodejs.org/) and a running MongoDB database instance (e.g. MongoDB Atlas).

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/divyadhan.git
cd divyadhan
npm install
```

### 3. Environment Variables Setup

Create a `.env` (or `.env.local`) file in the root directory and add the following configuration parameters:

```env
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/divyadhan?retryWrites=true&w=majority"

# Authentication (Generate secret with: openssl rand -base64 33)
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth Credentials (for Google Login)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Intelligence & Analysis (Required for AI Chat & Statement Analyzer)
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Database Initialization (Prisma Schema Sync)

Generate the Prisma Client types and sync your MongoDB schema rules:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience **DivyaDhan**!

---

## 📂 Project Structure

```text
├── prisma/               # Prisma Database Schema definition
├── public/               # Static assets & SVG icons
├── src/
│   ├── actions/          # Next.js Server Actions (Database queries, AI helpers)
│   ├── app/              # Next.js Routing Page system
│   │   ├── (auth)/       # Authentication pages (login/signup)
│   │   ├── api/          # Route handlers (AI routes, NextAuth endpoints)
│   │   └── dashboard/    # Main app layout and modular pages
│   ├── components/       # Reusable layout and dashboard page components
│   ├── lib/              # Constant parameters & helper utilities
│   └── types/            # TypeScript Interface definitions
```

---

## 🛡 License

This project is licensed under the MIT License - see the LICENSE file for details.
