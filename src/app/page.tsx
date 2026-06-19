'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Wallet,
  BarChart3,
  TrendingUp,
  PiggyBank,
  Shield,
  Zap,
  Target,
  Brain,
  ChevronDown,
  CreditCard,
  LineChart,
  CircleDollarSign,
  BookOpen,
  Activity,
  ArrowUpRight,
  Star,
  Check,
  Sun,
  Moon,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 16,
      mass: 0.8,
    },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 16,
    },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 16,
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const mockupAnimation = {
  hidden: { opacity: 0, y: 60, scale: 0.96, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 40,
      damping: 14,
      delay: 0.25,
    },
  },
};

const features = [
  {
    icon: Wallet,
    title: 'Smart Accounts',
    description: 'Track bank accounts, wallets, savings & lockers all in one place with real-time balance sync.',
    color: '#00C853',
    darkColor: '#1BD084',
  },
  {
    icon: BarChart3,
    title: 'Expense Analytics',
    description: 'AI-categorized expenses with beautiful breakdowns. Know exactly where your money goes.',
    color: '#FF4A5A',
    darkColor: '#FF4A5A',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracker',
    description: 'Monitor stocks, mutual funds, crypto, gold & real estate. See portfolio performance at a glance.',
    color: '#7F56D9',
    darkColor: '#9B72F8',
  },
  {
    icon: Target,
    title: 'Financial Goals',
    description: 'Set savings targets for your dream home, car, or emergency fund. Track progress visually.',
    color: '#1D50D7',
    darkColor: '#38BDF8',
  },
  {
    icon: Brain,
    title: 'AI Advisor',
    description: 'Get personalized financial insights and recommendations powered by advanced AI analysis.',
    color: '#FFA800',
    darkColor: '#FFA800',
  },
  {
    icon: Shield,
    title: 'Debt Manager',
    description: 'Track lending & borrowing with payment histories. Never lose track of who owes what.',
    color: '#64748B',
    darkColor: '#94A3B8',
  },
];

const stats = [
  { value: '100%', label: 'Your Data, Your Control' },
  { value: '12+', label: 'Financial Modules' },
  { value: '₹0', label: 'Completely Free' },
  { value: '∞', label: 'Unlimited Tracking' },
];

const capabilities = [
  { icon: CreditCard, label: 'Income & Expense Tracking' },
  { icon: LineChart, label: 'Net Worth Monitoring' },
  { icon: CircleDollarSign, label: 'Lending & Borrowing' },
  { icon: Activity, label: 'Financial Health Score' },
  { icon: BookOpen, label: 'Financial Notes & Journal' },
  { icon: BarChart3, label: 'Monthly Reports' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      {/* ─── Navbar ──────────────────────────────────────────── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-border py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-ai flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Divya<span className="gradient-text">Dhan</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text transition-colors">How It Works</a>
            <a href="#why-us" className="hover:text-text transition-colors">Why DivyaDhan</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-surface-hover transition-all duration-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              <Sun
                className={`w-4 h-4 absolute transition-all duration-500 ${
                  isDark
                    ? 'opacity-0 rotate-90 scale-0'
                    : 'opacity-100 rotate-0 scale-100 text-amber-500'
                }`}
              />
              <Moon
                className={`w-4 h-4 absolute transition-all duration-500 ${
                  isDark
                    ? 'opacity-100 rotate-0 scale-100 text-blue-400'
                    : 'opacity-0 -rotate-90 scale-0'
                }`}
              />
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text transition-colors px-4 py-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Background Orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: `rgba(0, 168, 125, var(--orb-opacity))` }}
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: `rgba(37, 99, 235, var(--orb-opacity))` }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: `rgba(124, 58, 237, calc(var(--orb-opacity) * 0.6))` }}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Your Personal Financial Operating System
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Take Control of{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">Your Money</span>
            <br className="hidden sm:block" />
            Like Never Before
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            DivyaDhan is your digital CFO — track income, expenses, investments, goals, debts,
            and net worth. Get AI-powered insights to grow your wealth smarter.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-primary text-white hover:bg-primary-hover transition-all duration-300 shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Start Free — No Card Needed
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium rounded-2xl border border-border text-text-secondary hover:text-text hover:border-border-light hover:bg-surface/50 transition-all duration-300"
            >
              See What&apos;s Inside
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            variants={mockupAnimation}
            className="relative mx-auto max-w-5xl"
            style={{ transformPerspective: 1200 }}
          >
            <div className="relative rounded-2xl border border-border bg-surface/30 backdrop-blur-sm p-2" style={{ boxShadow: 'var(--mockup-shadow)' }}>
              <div className="rounded-xl bg-surface border border-border overflow-hidden">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background border border-border text-xs text-text-muted">
                      divyadhan.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Mock stat cards row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Net Worth', value: '₹12.5L', color: 'var(--color-primary)', change: '+5.1%' },
                      { label: 'Monthly Income', value: '₹1.95L', color: 'var(--color-success)', change: '+8.2%' },
                      { label: 'Monthly Expenses', value: '₹1.21L', color: 'var(--color-danger)', change: '-3.5%' },
                      { label: 'Savings Rate', value: '38%', color: 'var(--color-ai)', change: '+2.1%' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="rounded-xl bg-background border border-border p-4"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <p className="text-[10px] text-text-muted mb-1">{stat.label}</p>
                        <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[10px] text-success mt-1">{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mock chart area */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-background border border-border p-4 h-32 flex items-end gap-1" style={{ boxShadow: 'var(--shadow-card)' }}>
                      {[40, 55, 45, 65, 50, 70, 60, 80, 72, 85, 78, 90].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.05, duration: 0.4 }}
                        />
                      ))}
                    </div>
                    <div className="rounded-xl bg-background border border-border p-4 h-32 flex items-center justify-center relative overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                      <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                        <motion.path
                          d="M 0 80 Q 25 60, 50 55 T 100 35 T 150 25 T 200 15"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="2.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 1.2, duration: 1.5 }}
                        />
                        <motion.path
                          d="M 0 80 Q 25 60, 50 55 T 100 35 T 150 25 T 200 15 L 200 100 L 0 100 Z"
                          fill="url(#areaGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.15 }}
                          transition={{ delay: 2.5, duration: 0.5 }}
                        />
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect behind the mockup */}
            <div className="absolute -inset-10 -z-10 rounded-3xl blur-3xl" style={{ background: `linear-gradient(to bottom, rgba(0, 168, 125, var(--orb-opacity)), rgba(37, 99, 235, var(--orb-opacity)), transparent)` }} />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ opacity: indicatorOpacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </motion.section>

      {/* ─── Stats Bar ───────────────────────────────────────── */}
      <section className="relative py-16 border-y border-border bg-surface/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ────────────────────────────────── */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ai/25 bg-ai/5 text-ai text-xs font-semibold mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Powerful Features
              </span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Master Your Finances</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-text-secondary max-w-2xl mx-auto text-lg">
              From daily expenses to long-term investments — DivyaDhan gives you a 360° view of your financial life.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature) => {
              const featureColor = isDark ? feature.darkColor : feature.color;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="group relative p-6 rounded-2xl bg-surface border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  whileHover={{ boxShadow: 'var(--shadow-card-hover)' }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${featureColor}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: featureColor }} />
                  </div>

                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(400px at 50% 0%, ${featureColor}08 0%, transparent 70%)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 sm:py-32 bg-surface/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-semibold mb-4">
                <Zap className="w-3.5 h-3.5" />
                Simple Setup
              </span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Get Started in{' '}
              <span className="gradient-text">3 Easy Steps</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up for free in seconds. No credit card required, no hidden charges.',
                icon: Sparkles,
              },
              {
                step: '02',
                title: 'Add Your Finances',
                description: 'Add your bank accounts, income sources, expenses, investments, and financial goals.',
                icon: Wallet,
              },
              {
                step: '03',
                title: 'Get Smart Insights',
                description: 'Receive AI-powered recommendations, track net worth, and watch your wealth grow.',
                icon: Brain,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative text-center p-6 rounded-2xl bg-surface/50 border border-border"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                {/* Step number */}
                <div className="text-6xl font-black text-primary/25 mb-4 select-none">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">{item.description}</p>

                {/* Connector line (except last) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Capabilities Grid ───────────────────────────────── */}
      <section id="why-us" className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <motion.div variants={fadeInLeft}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warning/25 bg-warning/5 text-warning text-xs font-semibold mb-4">
                  <Star className="w-3.5 h-3.5" />
                  Why Choose Us
                </span>
              </motion.div>

              <motion.h2 variants={fadeInLeft} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Built for <span className="gradient-text">Real People</span>,
                <br />Not Just Spreadsheet Lovers
              </motion.h2>

              <motion.p variants={fadeInLeft} className="text-text-secondary mb-8 leading-relaxed">
                DivyaDhan is designed to be the financial command center you always wished you had.
                Beautiful, intuitive, and powerful enough to replace a dozen spreadsheets.
              </motion.p>

              <motion.div variants={fadeInLeft} className="space-y-3">
                {[
                  'No subscription fees — completely free forever',
                  'Your data stays private and secure',
                  'Works beautifully on mobile and desktop',
                  'AI-powered insights, not guesswork',
                  'Track everything from ₹10 chai to ₹10L investments',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Grid */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {capabilities.map((cap) => (
                <motion.div
                  key={cap.label}
                  variants={fadeInRight}
                  className="group p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-300 text-center hover:-translate-y-1"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <cap.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{cap.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none"
          style={{ background: `rgba(0, 168, 125, var(--orb-opacity))` }}
        />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-4 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6"
          >
            Ready to Become Your
            <br />
            <span className="gradient-text">Own Financial CEO?</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Join DivyaDhan today and start making smarter financial decisions.
            It&apos;s free, it&apos;s beautiful, and it&apos;s built for you.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-10 py-4 text-base font-semibold rounded-2xl bg-primary text-white hover:bg-primary-hover transition-all duration-300 shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started — It&apos;s Free
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium rounded-2xl border border-border text-text-secondary hover:text-text hover:border-border-light transition-all duration-300"
            >
              I Already Have an Account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Divya<span className="gradient-text">Dhan</span>
              </span>
            </div>

            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} DivyaDhan. Your money, your rules.
            </p>

            <div className="flex items-center gap-6 text-sm text-text-muted">
              <Link href="/login" className="hover:text-text transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-text transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
