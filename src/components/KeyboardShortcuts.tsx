import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Keyboard } from 'lucide-react';

interface Props {
  onToggleDarkMode?: () => void;
}

const shortcuts = [
  { keys: ['/', 'Ctrl+K'], description: 'Focus search box' },
  { keys: ['Escape'], description: 'Close modal or dropdown' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['1-7'], description: 'Switch between filter tabs' },
  { keys: ['D'], description: 'Toggle dark mode' },
];

export default function KeyboardShortcuts({ onToggleDarkMode }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

    // Always handle Escape
    if (e.key === 'Escape') {
      setShowModal(false);
      return;
    }

    // Don't handle shortcuts when typing in inputs
    if (isInput) return;

    // ? to show shortcuts
    if (e.key === '?') {
      e.preventDefault();
      setShowModal(prev => !prev);
      return;
    }

    // / or Ctrl+K to focus search
    if (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('input[aria-label="Search destinations"]');
      searchInput?.focus();
      return;
    }

    // d for dark mode
    if (e.key === 'd' || e.key === 'D') {
      onToggleDarkMode?.();
      return;
    }

    // 1-7 to switch filter tabs
    const num = parseInt(e.key);
    if (num >= 1 && num <= 7) {
      const buttons = document.querySelectorAll<HTMLButtonElement>('[role="region"][aria-label="Filter and search results"] button[role="tab"], [role="region"][aria-label="Filter and search results"] button');
      const filterButtons = Array.from(buttons).filter(btn => !btn.closest('select') && btn.textContent?.trim());
      if (filterButtons[num - 1]) {
        filterButtons[num - 1].click();
      }
    }
  }, [onToggleDarkMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!showModal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {shortcuts.map(({ keys, description }) => (
            <div key={description} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map(key => (
                  <kbd
                    key={key}
                    className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-md"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-400 text-center">
            Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">?</kbd> to toggle this menu
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
