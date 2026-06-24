'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Download, Sparkles, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if user dismissed it recently
    const isDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    if (isDismissed) return;

    // iOS Detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // If it's iOS, we show the banner (since beforeinstallprompt is not fired on Safari iOS)
    if (ios) {
      // Delay showing it slightly for a better UX
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // Chrome / Android / Edge custom event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing it slightly for a better UX
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[380px] z-50 rounded-2xl border border-border bg-surface/90 glass p-4 shadow-2xl flex flex-col gap-3 font-sans"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ai flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-primary/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-text">Install DivyaDhan App</h4>
                <Sparkles className="w-3.5 h-3.5 text-warning" />
              </div>
              <p className="text-xs text-text-secondary mt-1 leading-normal">
                Access your AI Financial Command Center directly from your home screen with a fast, fullscreen experience.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIOSGuide ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-[11px] text-text-secondary bg-background/50 border border-border p-2.5 rounded-xl space-y-1.5"
          >
            <p className="font-semibold text-text">To install on iOS Safari:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Tap the **Share** button <span className="inline-block p-0.5 border border-border rounded bg-surface"><Share className="w-3 h-3 inline -mt-0.5" /></span> in the bottom toolbar.</li>
              <li>Scroll down and select **"Add to Home Screen"** <span className="font-bold">+</span>.</li>
            </ol>
          </motion.div>
        ) : (
          <div className="flex items-center justify-end gap-2.5 mt-1">
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold text-text-secondary hover:text-text px-3 py-2 transition-colors cursor-pointer"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
