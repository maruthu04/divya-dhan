import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(String(credentials.password), user.password);
        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          const email = user.email.toLowerCase().trim();
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            // Create user
            dbUser = await prisma.user.create({
              data: {
                name: user.name || 'Google User',
                email,
                password: '', // OAuth users don't need credential password
              },
            });

            // Seed initial bank accounts/categories
            await prisma.bankAccount.createMany({
              data: [
                {
                  userId: dbUser.id,
                  name: 'Primary Bank',
                  type: 'bank',
                  balance: 0,
                  color: '#3B82F6',
                  icon: 'Building2',
                },
                {
                  userId: dbUser.id,
                  name: 'Cash Wallet',
                  type: 'wallet',
                  balance: 0,
                  color: '#8B5CF6',
                  icon: 'Wallet',
                }
              ]
            });
          }

          token.id = dbUser.id;
        } catch (error) {
          console.error('Error handling Google login in jwt callback:', error);
        }
      } else if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
