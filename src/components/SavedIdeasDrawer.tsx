import React from 'react';
import { OddIdea } from '../types';
import { X, Bookmark, Trash2, ArrowUpRight, Copy, Check, Download } from 'lucide-react';
import { PipMascot } from './PipMascot';

interface SavedIdeasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedIdeas: OddIdea[];
  onSelectIdea: (idea: OddIdea) => void;
  onDeleteIdea: (id: string) => void;
}

export const SavedIdeasDrawer: React.FC<SavedIdeasDrawerProps> = ({
  isOpen,
  onClose,
  savedIdeas,
  onSelectIdea,
  onDeleteIdea,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySummary = async (idea: OddIdea) => {
    const summary = `${idea.name}\n${idea.tagline}\n\nMechanism: ${idea.surprisingMechanism}\nWorking V1: ${idea.workingFirstVersion}\nTarget: ${idea.targetUserAndMoment.who} (${idea.targetUserAndMoment.moment})`;
    await navigator.clipboard.writeText(summary);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    if (savedIdeas.length === 0) return;
    const content = JSON.stringify(savedIdeas, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oddly-saved-ideas-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-drawer-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500" />
            <h3 id="saved-drawer-title" className="font-display font-bold text-stone-900 text-base">
              Saved Oddities ({savedIdeas.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {savedIdeas.length > 0 && (
              <button
                onClick={handleExportAll}
                title="Export all saved as JSON"
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/50 transition-colors text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
              aria-label="Close saved drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedIdeas.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <PipMascot mood="idle" size="md" className="mx-auto opacity-70" />
              <p className="font-display font-semibold text-stone-700 text-sm">
                No saved oddities yet
              </p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                When an idea catches your imagination, click the bookmark icon on the idea card to save it here.
              </p>
            </div>
          ) : (
            savedIdeas.map((idea) => (
              <div
                key={idea.id}
                className="p-4 bg-[#FAF8F5] border border-stone-200/80 rounded-xl hover:border-amber-300 transition-all text-xs space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-stone-900 text-sm">
                      {idea.name}
                    </h4>
                    <p className="text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {idea.tagline}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteIdea(idea.id)}
                    title="Remove from saved"
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-1 border-t border-stone-200/40">
                  <span>For: {idea.targetUserAndMoment.who}</span>
                  <span>·</span>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => handleCopySummary(idea)}
                    className="text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium"
                  >
                    {copiedId === idea.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-400" />
                        <span>Copy summary</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSelectIdea(idea);
                      onClose();
                    }}
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>View idea</span>
                    <ArrowUpRight className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
