'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, Loader2, Save, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getUserProfileData, updateUserProfile, changeUserPassword } from '@/actions/profile';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  // Profile fields
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
    monthlyBudget: '',
  });

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getUserProfileData();
        if (res.success && res.data) {
          setProfileData({
            name: res.data.name || '',
            email: res.data.email || '',
            age: res.data.age?.toString() || '',
            occupation: res.data.occupation || '',
            monthlyBudget: res.data.monthlyBudget?.toString() || '',
          });
          setHasPassword(!!res.hasPassword);
        } else {
          toast.error(res.error || 'Failed to load user profile');
        }
      } catch (err) {
        console.error(err);
        toast.error('An unexpected error occurred while loading settings');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        name: profileData.name,
        age: profileData.age ? Number(profileData.age) : undefined,
        occupation: profileData.occupation || undefined,
        monthlyBudget: profileData.monthlyBudget ? Number(profileData.monthlyBudget) : undefined,
      });

      if (res.success) {
        toast.success('Profile updated successfully!');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if ((hasPassword && !currentPassword) || !newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changeUserPassword(currentPassword, newPassword);
      if (res.success) {
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setHasPassword(true);
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your profile details and security settings</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Password
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h2 className="text-base font-semibold text-text border-b border-border/50 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
                  <span className="text-[10px] font-medium text-text-muted bg-border/50 px-2 py-0.5 rounded-md flex items-center gap-1 select-none">
                    <Lock className="w-3 h-3 text-text-muted/80" /> Locked
                  </span>
                </div>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg text-sm text-text-muted cursor-not-allowed select-none focus:outline-none"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Age (Years)</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  placeholder="e.g. 28"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Occupation</label>
                <input
                  type="text"
                  value={profileData.occupation}
                  onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Monthly Budget */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Monthly Spend Budget (₹)</label>
                <input
                  type="number"
                  value={profileData.monthlyBudget}
                  onChange={(e) => setProfileData({ ...profileData, monthlyBudget: e.target.value })}
                  placeholder="e.g. 35000"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
                <p className="text-[10px] text-text-muted">Set a target budget limit to track your daily financial health score.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-background font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <h2 className="text-base font-semibold text-text border-b border-border/50 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Change Password
            </h2>

            <div className="space-y-5">
              {/* Current Password */}
              {hasPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-background font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Changing...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
