import React from 'react';
import { Key, ShieldAlert } from 'lucide-react';
import { PipMascot } from './PipMascot';

interface MissingKeyNoticeProps {
  onRetry?: () => void;
}

export const MissingKeyNotice: React.FC<MissingKeyNoticeProps> = ({ onRetry }) => {
  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-xs text-stone-800">
      <div className="flex items-start gap-4">
        <PipMascot mood="thinking" size="md" className="shrink-0" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-700" />
            <h3 className="font-display font-semibold text-stone-900 text-lg">
              Gemini API Key Required
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Oddly uses real Gemini 3.8 models to brainstorm genuine non-obvious software mechanisms and draft copy-ready build prompts.
          </p>
          <div className="p-3 bg-white/80 border border-amber-200/60 rounded-xl text-xs space-y-1.5 text-stone-700">
            <p className="font-semibold text-stone-800">How to connect your key:</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-600">
              <li>Open the <strong>Settings &gt; Secrets</strong> panel in the AI Studio environment.</li>
              <li>Add or verify your <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-amber-800">GEMINI_API_KEY</code>.</li>
              <li>Once set, the server picks it up automatically.</li>
            </ol>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors shadow-2xs"
            >
              Check connection again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
