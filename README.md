# 🏛️ DivyaDhan (दिव्य धन) - AI Financial Command Center

<div align="center">

![DivyaDhan Banner](https://img.shields.io/badge/DivyaDhan-Financial%20OS-emerald?style=for-the-badge&logo=google-cloud&logoColor=white)

[![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=flat-square)](https://github.com/maruthu04/divya-dhan)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Next.js Stack](https://img.shields.io/badge/Stack-Next.js%2016-black?style=flat-square&logo=nextdotjs)](https://github.com/maruthu04/divya-dhan)
[![Database](https://img.shields.io/badge/Database-MongoDB-green?style=flat-square&logo=mongodb)](https://github.com/maruthu04/divya-dhan)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](https://github.com/maruthu04/divya-dhan/pulls)

**Your Sovereign Financial Operating System & AI-Powered Wealth Advisor** 🚀

Aggregate accounts, track net worth, analyze bank statements with AI, and get personalized advice—all under your own control.

[Explore Codebase](https://github.com/maruthu04/divya-dhan) • [Report Issues](https://github.com/maruthu04/divya-dhan/issues)

</div>

---

## 🌟 Overview

**DivyaDhan** (meaning *Divine Wealth* in Sanskrit) is a premium, self-hosted **Personal Financial Operating System**. It functions as your digital Chief Financial Officer (CFO) aggregating accounts, portfolios, lending logs, goals, and subscriptions into one single, gorgeous dashboard.

Unlike commercial tools that monetize your data or lock features behind paywalls, DivyaDhan is completely free, secure, and private. It integrates a contextual **AI Financial Advisor** powered by **Google Gemini** that understands your live portfolio, giving you a custom financial planner in your pocket.

### Why DivyaDhan?

✨ **Sovereign Control** - Keep 100% of your financial records private on your own hosted database.  
🤖 **AI-Infused Analysis** - Talk to your data. Ask Gemini about your spending trends or investment strategies.  
📊 **Zero Spreadsheets** - Beautiful, interactive charting (Recharts) automatically computes net worth, health diagnostics, and budgets.  
💎 **Premium Glassmorphic Design** - Optimized dark/light modes with tailored HSL palettes, buttery-smooth Framer Motion transitions, and a premium modern UX.  
⚡ **Automated Ingestion** - Drag-and-drop bank statements; watch our analyzer automatically categorize and log transactions.

---

## ✨ Features Breakdown

### 📊 **1. Consolidated Financial Dashboard**
*   **Net Worth Engine:** Real-time asset-liability tracking showing you where your wealth is concentrated.
*   **Cash Flow Tracking:** Monitor your monthly income vs. expense delta.
*   **Historical Trends:** Interactive line and area charts mapping your wealth growth over time.
*   **Financial Health Diagnostic:** A dynamic grading algorithm scoring your *Savings Rate, Debt Ratio, Emergency Buffer, and Portfolio Diversity* with action recommendations.

### 🏛️ **2. Smart Accounts & Liquidity**
*   Group capital across **Savings Accounts, Physical Lockers, Cash Wallets, and Digital emergency funds**.
*   Custom icons, bank names, and color coordinates for clean structural indexing.

### 📈 **3. Comprehensive Wealth & Investments**
*   Track **Stocks, Mutual Funds, ETFs, Crypto, Gold, Bonds, Real Estate, and FDs**.
*   Logs initial buy dates, purchase price, total units, and computes current profit/loss dynamics.
*   Built-in **SIP (Systematic Investment Plan) Tracker** to monitor active compounding schedules.

### 🤖 **4. AI Financial Advisor (Gemini integration)**
*   A chat interface that leverages `@google/genai` to analyze your accounts, investments, and goals.
*   Ask contextual questions: *"Based on my ₹12L net worth and current mutual fund portfolio, what are my risks?"* or *"Am I on track for my Retirement goal?"*

### 📁 **5. Intelligent Bank Statement Analyzer**
*   No manual logging for hundreds of transactions. 
*   Simply drag and drop **PDF or CSV** bank statements.
*   The system parses the document, cleans up merchant strings, and auto-categorizes the logs under food, bills, transport, shopping, etc.

### 🛡️ **6. Lending & Borrowing Logbook**
*   Keep tab of interpersonal loans given to friends/family or borrowings taken.
*   Log partial repayment installments, due dates, status updates (`pending`, `partial`, `completed`), and record inline notes.

### 🎯 **7. Life Goals Planner**
*   Visual cards for major targets: Emergency Fund, Car, House, Education, or Custom dreams.
*   Progress bars showing distance to completion based on active savings balances.

### 🔄 **8. Recurring Subscriptions Manager**
*   List active SaaS software, streaming servers, gym memberships, and utility bills.
*   Calculates renewal frequency (weekly, monthly, yearly) and warns you about next due dates.

### 📝 **9. Financial Journal & Notes**
*   Pin and categorize investment rules, tax logs, general journaling thoughts, and reminders.

---

## 🏗️ Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                       FRONTEND                         │
   │      React 19 (Vite)  •  Next.js 16 (App Router)       │
   │  Tailwind CSS v4  •  Framer Motion  •  Recharts  •     │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                    SERVER ACTIONS                      │
   │        Next.js Server Actions (Secure DB Mutations)    │
   │      NextAuth.js v5 (OAuth & Credentials Security)     │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                  AI & PARSING SERVICES                 │
   │     @google/genai (Gemini AI Chat & Recommendations)   │
   │        Papaparse / XLSX (Automated Statement Ingestion)│
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                       DATABASE                         │
   │        Prisma ORM  •  MongoDB Database Cluster         │
   └────────────────────────────────────────────────────────┘
```

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, route handlers)
*   **Database Schema:** [Prisma ORM](https://www.prisma.io/) with a native [MongoDB](https://www.mongodb.com/) provider
*   **Security & Auth:** [NextAuth.js v5](https://nextjs.org/docs/app/building-your-application/authentication) (supporting both classic Credential-based hashing and Google OAuth credentials)
*   **AI Integration:** Native SDK `@google/genai` communicating directly with Google Gemini models.
*   **Parser Frameworks:** `react-dropzone` for upload handling, combined with `xlsx` and `papaparse` for spreadsheet parsing.
*   **UI/UX:** Fully custom Tailwind styling powered by modern HSL theme variables.

---

## 🚀 Quick Start Guide

### Prerequisites
Before running, make sure you have:
*   [Node.js (v20+)](https://nodejs.org/)
*   A running MongoDB database instance (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas/database) or local MongoDB Community Server).
*   A Google AI Studio API key (for Gemini features). Obtain one free [here](https://aistudio.google.com/).

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/maruthu04/divya-dhan.git
cd divya-dhan
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
Create a `.env` file in the root directory and add the following keys:
```env
# Database URI (MongoDB Atlas or Local Connection string)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/divyadhan?retryWrites=true&w=majority"

# Authentication Secrets (Generate one using: openssl rand -base64 33)
AUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth Credentials (for Google One-Click Login)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Intelligence & Analysis (Required for AI Chatbot & Analyzer recommendations)
GEMINI_API_KEY="your_gemini_api_key_here"
```

**4. Sync Database Schema**
Compile the Prisma client and push the schema model structures directly into your MongoDB:
```bash
npx prisma generate
npx prisma db push
```

**5. Start the App**
Fire up the local development server:
```bash
npm run dev
```

🎉 The dashboard is now live at [http://localhost:3000](http://localhost:3000)!

---

## 📂 Project Structure

```text
├── prisma/               # Database Schema configuration (schema.prisma)
├── public/               # SVG Icons, Static logo assets & images
├── src/
│   ├── actions/          # Next.js Server Actions (Database reads/writes & AI execution)
│   ├── app/              # Next.js App Router Page directories
│   │   ├── (auth)/       # Security templates (login/signup screens)
│   │   ├── api/          # Backchannel routes (AI chat endpoints & Auth handlers)
│   │   └── dashboard/    # Main platform dashboard & workspace components
│   ├── components/       # Reusable layout fragments, panels, charts & charts sub-modules
│   ├── lib/              # Constant maps, formatting utilities & global settings
│   ├── types/            # App-wide TypeScript Interface contracts
│   ├── auth.ts           # NextAuth.js setup and strategy definition
│   └── proxy.ts          # API connection proxies
```

---

## 🤝 Contributing

We welcome contributions! To suggest features, patch bugs, or submit updates:

1. **Fork** the repository
2. **Create** your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your modifications:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** your commits:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request against the main branch

---

## 📜 License

Distributed under the **MIT License**. Check out `LICENSE` for details.

---

## 👨‍💻 Author

**Maruthu Devendrar (Kamlesh Singh)**

🎓 Final Year Software Engineering Student  
💻 Full Stack Developer | AI Enthusiast  
🚀 Passionate about Next.js, React, and Generative AI

[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat-square&logo=github)](https://github.com/maruthu04)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/maruthu07)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-purple?style=flat-square&logo=vercel)](https://md-port.vercel.app)

---

## ⭐ Support & Acknowledgments
If you find DivyaDhan useful, please consider:
*   ⭐ Starring this repository on GitHub!
*   Sharing it with friends seeking a private alternative to money tracking applications.

*Special thanks to Google Gemini, TailwindCSS, Prisma, and Next.js for supplying the building blocks.*
