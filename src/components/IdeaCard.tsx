import React, { useState } from 'react';
import { OddIdea } from '../types';
import { 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Hammer, 
  MessageSquareCode, 
  RefreshCw, 
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Coins,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';
import { PipMascot } from './PipMascot';

interface IdeaCardProps {
  idea: OddIdea;
  isSaved: boolean;
  onToggleSave: (idea: OddIdea) => void;
  onBuildThis: (idea: OddIdea) => void;
  onChallengeIt: (idea: OddIdea) => void;
  onAnotherOddity: () => void;
  isLoadingAnother: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isSaved,
  onToggleSave,
  onBuildThis,
  onChallengeIt,
  onAnotherOddity,
  isLoadingAnother,
}) => {
  const [showMonetization, setShowMonetization] = useState(false);
  const [showAssumption, setShowAssumption] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  return (
    <article className="w-full max-w-3xl mx-auto bg-white border border-stone-200/90 rounded-2xl shadow-xs p-6 sm:p-8 transition-all">
      {/* Top row: Name, World context kicker, Bookmark button */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          {idea.worldContext && (
            <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5">
              <span>World:</span>
              <span className="text-stone-800 font-semibold">{idea.worldContext}</span>
            </div>
          )}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {idea.name}
          </h2>
          <p className="mt-1 text-base sm:text-lg text-stone-700 leading-snug font-medium">
            {idea.tagline}
          </p>
        </div>

        {/* Bookmark secondary button */}
        <button
          onClick={() => onToggleSave(idea)}
          title={isSaved ? 'Remove from saved' : 'Save to bookmarks'}
          className={`shrink-0 p-2.5 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isSaved
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-800'
          }`}
          aria-label={isSaved ? 'Saved idea' : 'Save idea'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Core Essentials Grid */}
      <div className="py-6 space-y-5 text-sm">
        {/* 1. Target User & Specific Moment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/60">
          <div>
            <div className="text-xs font-semibold text-stone-500 flex items-center gap-1 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>WHO USES IT</span>
            </div>
            <p className="text-stone-800 font-medium leading-relaxed">
              {idea.targetUserAndMoment.who}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-500 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>THE EXACT MOMENT</span>
            </div>
            <p className="text-stone-800 font-medium leading-relaxed">
              {idea.targetUserAndMoment.moment}
            </p>
          </div>
        </div>

        {/* 2. The Surprising Mechanism */}
        <div className="p-4 bg-[#F2EEFB]/60 rounded-xl border border-[#E4DCF5]">
          <div className="text-xs font-semibold text-purple-900 flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            <span>THE SURPRISING MECHANISM</span>
          </div>
          <p className="text-stone-800 leading-relaxed font-medium">
            {idea.surprisingMechanism}
          </p>
        </div>

        {/* 3. What the Working First Version Actually Does */}
        <div className="p-4 bg-[#E8F6F0]/60 rounded-xl border border-[#D1EFE2]">
          <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>WHAT THE WORKING FIRST VERSION ACTUALLY DOES</span>
          </div>
          <p className="text-stone-800 leading-relaxed font-medium">
            {idea.workingFirstVersion}
          </p>
        </div>
      </div>

      {/* Progressive Disclosure Sections */}
      <div className="border-t border-stone-100 pt-3 space-y-2">
        {/* Section: Plausible Reason Someone Would Pay (Monetization Hypothesis) */}
        <div className="border border-stone-200/80 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowMonetization(!showMonetization)}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Monetization Hypothesis: {idea.monetizationHypothesis.primaryModel}</span>
            </div>
            {showMonetization ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          {showMonetization && (
            <div className="p-4 pt-0 border-t border-stone-100 bg-stone-50/40 text-xs text-stone-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">Who pays & for what:</span>
                  <p className="text-stone-600">
                    <strong className="text-stone-800">{idea.monetizationHypothesis.whoPays}</strong> pays for {idea.monetizationHypothesis.whatTheyPayFor}.
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">Why free tools fail here:</span>
                  <p className="text-stone-600">{idea.monetizationHypothesis.whyFreeAlternativeFails}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-200/40">
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">Cheapest 48-hr test:</span>
                  <p className="text-stone-600">{idea.monetizationHypothesis.cheapestTest}</p>
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">Reaching first 5 users:</span>
                  <p className="text-stone-600">{idea.monetizationHypothesis.firstUserReach}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: The Biggest Assumption that could make it fail */}
        <div className="border border-stone-200/80 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowAssumption(!showAssumption)}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>The Fragile Assumption (What could break)</span>
            </div>
            {showAssumption ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          {showAssumption && (
            <div className="p-4 pt-2 border-t border-stone-100 bg-rose-50/30 text-xs text-stone-700">
              <p className="font-medium text-stone-800 leading-relaxed">
                {idea.biggestAssumption}
              </p>
              <p className="mt-2 text-stone-500 italic">
                Rule of thumb: Test this specific assumption before investing time into complex code or styling.
              </p>
            </div>
          )}
        </div>

        {/* Section: Pip's Decision Rationale */}
        <div className="border border-stone-200/80 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowDecision(!showDecision)}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Pip's Selection Rationale</span>
            </div>
            {showDecision ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>
          {showDecision && (
            <div className="p-4 pt-2 border-t border-stone-100 bg-[#FAF8F5] text-xs text-stone-700">
              <p className="leading-relaxed text-stone-700">
                {idea.decisionSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left primary actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={() => onBuildThis(idea)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          >
            <Hammer className="w-3.5 h-3.5 text-amber-300" />
            <span>Build this</span>
          </button>

          <button
            onClick={() => onChallengeIt(idea)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF4ED] hover:bg-[#F3EADB] text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          >
            <MessageSquareCode className="w-3.5 h-3.5 text-stone-600" />
            <span>Challenge it</span>
          </button>
        </div>

        {/* Another oddity button */}
        <button
          onClick={onAnotherOddity}
          disabled={isLoadingAnother}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 text-xs font-medium rounded-xl border border-transparent hover:border-stone-200 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnother ? 'animate-spin' : ''}`} />
          <span>Another oddity</span>
        </button>
      </div>
    </article>
  );
};
