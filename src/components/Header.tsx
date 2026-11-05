import React from 'react';
import { Bookmark, Sparkles, Key } from 'lucide-react';
import { PipMascot } from './PipMascot';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onResetHome: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onResetHome,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={onResetHome}
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
        >
          <PipMascot size="sm" mood="idle" className="transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
              Oddly
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            </span>
            <span className="text-xs text-stone-700 tracking-tight">The tiny invention studio</span>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!hasApiKey && (
            <div
              title="Gemini API Key missing or unconfigured"
              className="hidden sm:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Key needed</span>
            </div>
          )}

          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white/80 hover:bg-white border border-stone-200/80 rounded-lg shadow-2xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Bookmark className="w-3.5 h-3.5 text-stone-500" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-full font-mono text-[11px]">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
