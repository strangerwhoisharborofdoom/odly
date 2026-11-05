import React, { useState, useEffect } from 'react';
import { OddIdea, ProposedRevision } from './types';
import { PipMascot, PipMood } from './components/PipMascot';
import { Header } from './components/Header';
import { IdeaCard } from './components/IdeaCard';
import { BuildPromptModal } from './components/BuildPromptModal';
import { ChallengeDrawer } from './components/ChallengeDrawer';
import { SavedIdeasDrawer } from './components/SavedIdeasDrawer';
import { MissingKeyNotice } from './components/MissingKeyNotice';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Compass, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const SUGGESTED_WORLDS = [
  'street food',
  'grandparents',
  'repair shops',
  'rainy days',
  'forgotten hobbies',
  'antique clocks',
  'seed saving',
  'lost keys',
];

const STORAGE_SAVED_KEY = 'oddly_saved_ideas';
const STORAGE_CURRENT_KEY = 'oddly_current_idea';

export default function App() {
  const [worldInput, setWorldInput] = useState('');
  const [currentIdea, setCurrentIdea] = useState<OddIdea | null>(null);
  const [recentIdeas, setRecentIdeas] = useState<string[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<OddIdea[]>([]);
  
  // Modals & Drawers
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Mascot dynamic mood
  const [pipMood, setPipMood] = useState<PipMood>('idle');

  // Load saved ideas and current idea from localStorage on mount
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem(STORAGE_SAVED_KEY);
      if (storedSaved) {
        setSavedIdeas(JSON.parse(storedSaved));
      }
      const storedCurrent = localStorage.getItem(STORAGE_CURRENT_KEY);
      if (storedCurrent) {
        setCurrentIdea(JSON.parse(storedCurrent));
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data:', e);
    }

    // Check health & API key
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHasApiKey(data.hasApiKey);
      }
    } catch {
      // Server may be starting
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Generate an idea
  const handleGenerate = async (overrideWorld?: string) => {
    if (isGenerating) return;

    const chosenWorld = overrideWorld !== undefined ? overrideWorld : worldInput.trim();
    setIsGenerating(true);
    setErrorMessage(null);
    setPipMood('thinking');

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: chosenWorld || undefined,
          recentIdeas: recentIdeas.slice(-10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'MISSING_API_KEY') {
          setHasApiKey(false);
          throw new Error(data.message || 'Gemini API key is required');
        }
        throw new Error(data.message || 'Failed to generate idea');
      }

      const newIdea: OddIdea = data.idea;
      setCurrentIdea(newIdea);
      setRecentIdeas((prev) => [...prev, newIdea.name]);
      setPipMood('beaming');

      try {
        localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(newIdea));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to brainstorm an idea. Please try again.');
      setPipMood('idle');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setPipMood('idle');
      }, 2500);
    }
  };

  // Toggle bookmark
  const handleToggleSave = (idea: OddIdea) => {
    setSavedIdeas((prev) => {
      const exists = prev.some((item) => item.id === idea.id || item.name === idea.name);
      let updated: OddIdea[];
      if (exists) {
        updated = prev.filter((item) => item.id !== idea.id && item.name !== idea.name);
        showToast(`Removed "${idea.name}" from saved.`);
      } else {
        const savedItem = { ...idea, saved: true };
        updated = [savedItem, ...prev];
        showToast(`Saved "${idea.name}" to your oddities collection!`);
      }
      try {
        localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedIdeas((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  // Apply Pip's proposed revision
  const handleApplyRevision = (revision: ProposedRevision) => {
    if (!currentIdea) return;
    const updatedIdea: OddIdea = {
      ...currentIdea,
      ...revision.fieldModifications,
    };
    setCurrentIdea(updatedIdea);
    try {
      localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(updatedIdea));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    showToast(`Applied revision: "${revision.summary}"`);
    setPipMood('beaming');
  };

  const isCurrentIdeaSaved = Boolean(
    currentIdea && savedIdeas.some((i) => i.id === currentIdea.id || i.name === currentIdea.name)
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-amber-200">
      {/* Top Bar Header */}
      <Header
        savedCount={savedIdeas.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onResetHome={() => {
          setCurrentIdea(null);
          localStorage.removeItem(STORAGE_CURRENT_KEY);
        }}
        hasApiKey={hasApiKey}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-stone-800 flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Experience Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Missing API Key honest warning banner */}
        {!hasApiKey && <MissingKeyNotice onRetry={checkHealth} />}

        {/* If no idea is currently generated or active: show clean Home view */}
        {!currentIdea ? (
          <div className="max-w-xl mx-auto w-full text-center space-y-8 my-auto">
            {/* Mascot */}
            <div className="inline-block relative">
              <PipMascot mood={pipMood} size="xl" className="mx-auto" />
              {isGenerating && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap animate-pulse">
                  Searching unpaved paths...
                </div>
              )}
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight text-balance">
                What strange little thing shall we build?
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
                One unusual, working software tool at a time. Tested for solo builders with an engineering conscience.
              </p>
            </div>

            {/* Main Primary Action & Optional Compact Input */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 text-left">
              <div>
                <label
                  htmlFor="world-input"
                  className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-stone-500" />
                    <span>A world you care about…</span>
                  </span>
                  <span className="text-[11px] text-stone-600 font-normal">Optional</span>
                </label>
                <input
                  id="world-input"
                  type="text"
                  value={worldInput}
                  onChange={(e) => setWorldInput(e.target.value)}
                  placeholder="e.g. street food, grandparents, repair shops, rainy days..."
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {/* Clickable example suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-stone-600 mr-1">Try:</span>
                {SUGGESTED_WORLDS.map((world) => (
                  <button
                    key={world}
                    type="button"
                    onClick={() => {
                      setWorldInput(world);
                      handleGenerate(world);
                    }}
                    disabled={isGenerating}
                    className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-amber-100/70 text-stone-700 hover:text-stone-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    {world}
                  </button>
                ))}
              </div>

              {/* Main Button: Surprise me */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="w-full mt-2 py-3 px-6 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Inventing an oddity...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Surprise me.</span>
                  </>
                )}
              </button>
            </div>

            {/* Error state */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Brainstorming Stumbled</p>
                  <p className="text-stone-700">{errorMessage}</p>
                  <button
                    onClick={() => handleGenerate()}
                    className="font-semibold text-rose-800 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Idea Card View */
          <div className="space-y-6 animate-fade-in">
            {/* Context breadcrumb / Home button */}
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <button
                onClick={() => {
                  setCurrentIdea(null);
                  localStorage.removeItem(STORAGE_CURRENT_KEY);
                }}
                className="hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
              >
                <span>← Back to invention studio</span>
              </button>
              <span className="text-stone-400">1 idea presented with care</span>
            </div>

            {/* The Compact, Readable Idea Card */}
            <IdeaCard
              idea={currentIdea}
              isSaved={isCurrentIdeaSaved}
              onToggleSave={handleToggleSave}
              onBuildThis={() => setIsBuildModalOpen(true)}
              onChallengeIt={() => setIsChallengeOpen(true)}
              onAnotherOddity={() => handleGenerate()}
              isLoadingAnother={isGenerating}
            />

            {/* Error display if another oddity fails */}
            {errorMessage && (
              <div className="max-w-3xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Next oddity paused</p>
                  <p className="text-stone-700">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-stone-600 border-t border-stone-200/50">
        <p>Oddly — No fake dashboards, no chatbot wrappers. Just strange, working software.</p>
      </footer>

      {/* "Build this" Modal (The App-Prompt Maker) */}
      {currentIdea && (
        <BuildPromptModal
          idea={currentIdea}
          isOpen={isBuildModalOpen}
          onClose={() => setIsBuildModalOpen(false)}
        />
      )}

      {/* "Challenge it" Drawer (Pip the Logic Companion) */}
      {currentIdea && (
        <ChallengeDrawer
          idea={currentIdea}
          isOpen={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
          onApplyRevision={handleApplyRevision}
        />
      )}

      {/* Saved Ideas Drawer */}
      <SavedIdeasDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedIdeas={savedIdeas}
        onSelectIdea={(idea) => {
          setCurrentIdea(idea);
          localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(idea));
        }}
        onDeleteIdea={handleDeleteSaved}
      />
    </div>
  );
}
