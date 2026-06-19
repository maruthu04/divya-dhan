'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingDetails } from '@/actions/auth';
import { Sparkles, Loader2, ShieldCheck } from 'lucide-react';

interface OnboardingOverlayProps {
  userId: string;
  initialName: string;
}

export default function OnboardingOverlay({ userId, initialName }: OnboardingOverlayProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !occupation) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await saveOnboardingDetails(
        userId,
        name.trim(),
        Number(age),
        occupation,
        monthlyBudget ? Number(monthlyBudget) : undefined
      );

      if (res?.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="absolute inset-0 bg-background/40 pointer-events-none" />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-up overflow-hidden z-50">
        {/* Decorative background gradients */}
        <div
          className="absolute top-[-40%] left-[-40%] w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none"
          style={{ background: `rgba(0, 200, 83, 0.05)` }}
        />
        <div
          className="absolute bottom-[-40%] right-[-40%] w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none"
          style={{ background: `rgba(29, 80, 215, 0.05)` }}
        />

        <div className="relative z-10 text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to DivyaDhan</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text tracking-tight">
            Personalize your CFO
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Provide a few details to tailor your financial advisor and analytics
          </p>
        </div>

        {error && (
          <div className="relative z-10 mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <label htmlFor="onboarding-name" className="block text-xs font-semibold text-text-secondary mb-1.5">
              Full Name *
            </label>
            <input
              id="onboarding-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="onboarding-age" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Age *
              </label>
              <input
                id="onboarding-age"
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="e.g. 28"
              />
            </div>

            <div>
              <label htmlFor="onboarding-occupation" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Occupation *
              </label>
              <select
                id="onboarding-occupation"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="" disabled>Select role</option>
                <option value="student">Student</option>
                <option value="salaried">Salaried Employee</option>
                <option value="business">Business Owner</option>
                <option value="freelancer">Freelancer</option>
                <option value="retired">Retired</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="onboarding-budget" className="block text-xs font-semibold text-text-secondary">
                Monthly Budget (Optional)
              </label>
              <span className="text-[10px] text-text-muted">Can change later</span>
            </div>
            <input
              id="onboarding-budget"
              type="number"
              min="0"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="e.g. 50000"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Complete Onboarding</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-text-muted border-t border-border pt-4">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Your information is encrypted and stored securely</span>
        </div>
      </div>
    </div>
  );
}
