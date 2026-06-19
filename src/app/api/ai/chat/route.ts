import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch user profile data
    const [incomes, expenses, accounts, investments, lendings, borrowings, goals] = await Promise.all([
      prisma.income.findMany({ where: { userId } }),
      prisma.expense.findMany({ where: { userId } }),
      prisma.bankAccount.findMany({ where: { userId } }),
      prisma.investment.findMany({ where: { userId } }),
      prisma.lending.findMany({ where: { userId } }),
      prisma.borrowing.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
    ]);

    const bankSum = accounts.reduce((s: number, a: any) => s + a.balance, 0);
    const invSum = investments.reduce((s: number, i: any) => s + i.currentValue, 0);
    const lentSum = lendings.reduce((s: number, l: any) => s + l.remainingBalance, 0);
    const borrowSum = borrowings.reduce((s: number, b: any) => s + b.remainingBalance, 0);

    const totalAssets = bankSum + invSum + lentSum;
    const netWorth = totalAssets - borrowSum;

    const recentExpenses = expenses.slice(0, 10).map((e: any) => `${e.category}: ₹${e.amount} (${e.description})`).join(', ');

    const systemPrompt = `You are DivyaDhan AI, a premium Personal Digital CFO, Wealth Manager, and Financial Advisor.
You are analyzing the user's real-time financial data:
- Net Worth: ₹${netWorth} (Assets: ₹${totalAssets}, Liabilities: ₹${borrowSum})
- Bank/Wallets: ₹${bankSum}
- Investments Portfolio: ₹${invSum} (Holdings: ${investments.map((i: any) => i.name).join(', ') || 'None'})
- Outstanding Loans (Money Borrowed): ₹${borrowSum}
- Outstanding Debts (Money Lent to others): ₹${lentSum}
- Active Goals: ${goals.map((g: any) => `${g.name} (Target: ₹${g.targetAmount}, Saved: ₹${g.currentAmount})`).join(', ') || 'None'}
- Recent Spending Habits: ${recentExpenses || 'No expenses logged yet'}

Provide highly professional, empathetic, and exact wealth management advice. Format your answers clearly using markdown list elements, bullet points, and headers. Be concise and prioritize actionable steps. Make sure to refer to their real data details listed above.`;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      // Intelligent fallback if no API key configured
      const reply = `I've analyzed your portfolio. To get real-time customized AI projections, please add your GEMINI_API_KEY in .env.local.\n\nHere's a quick assessment of your data:\n\n• **Liquidity:** You have ₹${bankSum} in cash/bank accounts.\n• **Wealth:** Your investments stand at ₹${invSum}.\n• **Debts:** You have ₹${borrowSum} in outstanding borrowings.\n` +
        (goals.length > 0 ? `• **Goals:** Your top goal is "${goals[0].name}" (progress: ${((goals[0].currentAmount / (goals[0].targetAmount || 1)) * 100).toFixed(0)}%).` : '• **Goals:** You have no active goals set. Set one to start saving systematically.');
      return NextResponse.json({ content: reply });
    }

    // Call Gemini API via SDK
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `${systemPrompt}\n\nUser conversation history:\n${messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\nAssistant:`,
      });
    } catch (primaryError: any) {
      console.warn('Primary model gemini-3.5-flash failed, trying fallback gemini-2.5-flash...', primaryError);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser conversation history:\n${messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\nAssistant:`,
        });
      } catch (fallbackError: any) {
        console.warn('Fallback model gemini-2.5-flash failed, trying second fallback gemini-3.1-flash-lite...', fallbackError);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${systemPrompt}\n\nUser conversation history:\n${messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\nAssistant:`,
        });
      }
    }

    const responseText = response.text || 'Sorry, I encountered an issue processing your request.';

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      content: `Google Gemini API Error: **${error.message || 'Unknown error occurred'}**.`
    });
  }
}
