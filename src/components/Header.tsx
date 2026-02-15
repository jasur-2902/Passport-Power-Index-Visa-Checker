import { useState, useEffect, useCallback } from 'react';
import { Globe, Share2, Check, Sun, Moon, RotateCcw } from 'lucide-react';

interface Props {
  onShare?: () => void;
  shareState?: 'idle' | 'copied';
  totalCountries?: number;
  onReset?: () => void;
}

export default function Header({ onShare, shareState = 'idle', totalCountries, onReset }: Props) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = useCallback(() => setIsDark(prev => !prev), []);

  return (
    <header
      className={`px-4 header-sticky ${isScrolled ? 'header-scrolled' : 'pt-10 pb-8'}`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-logo-enter"
              aria-hidden="true"
            >
              <Globe className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                VisaCheck
              </h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 -mt-0.5">
                {totalCountries
                  ? `Explore ${totalCountries} countries`
                  : 'Travel planner for couples & groups'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReset && (
              <button
                onClick={onReset}
                aria-label="Reset all selections"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-medium press-effect shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <button
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all press-effect shadow-sm"
            >
              {isDark ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>

            {onShare && (
              <button
                onClick={onShare}
                aria-label={shareState === 'copied' ? 'Link copied' : 'Share your passport selections'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-medium press-effect shadow-sm"
              >
                {shareState === 'copied' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
