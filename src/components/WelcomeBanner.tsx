import { useState } from 'react';
import { Globe, Users, Heart, X } from 'lucide-react';

const STORAGE_KEY = 'visacheck-welcome-dismissed';

const features = [
  { icon: Globe, title: 'Global coverage', description: '199 passports and destinations' },
  { icon: Users, title: 'Group travel', description: 'Find common visa-free destinations' },
  { icon: Heart, title: 'Save favorites', description: 'Bookmark destinations you love' },
];

function getInitialVisible(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(getInitialVisible);
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`relative mb-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-violet-950/50 overflow-hidden transition-all duration-300 ${
        dismissing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fade-in-up'
      }`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        aria-label="Dismiss welcome message"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          Welcome to VisaCheck
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md">
          Select your passport to discover visa-free destinations worldwide.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-2.5 p-3 bg-white/60 dark:bg-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
