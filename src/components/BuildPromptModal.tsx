import React, { useState, useEffect } from 'react';
import { OddIdea, ReferenceTemplate, BuildPromptResult } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  RefreshCw,
  FileCode2,
  FileText
} from 'lucide-react';
import { PipMascot } from './PipMascot';

interface BuildPromptModalProps {
  idea: OddIdea;
  isOpen: boolean;
  onClose: () => void;
}

export const BuildPromptModal: React.FC<BuildPromptModalProps> = ({
  idea,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [templates, setTemplates] = useState<ReferenceTemplate[]>([]);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Fetch or regenerate the prompt
  const fetchPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ideas/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to craft build prompt');
      }
      setPromptText(data.fullPrompt);
      setTemplates(data.templates || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the prompt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && idea) {
      fetchPrompt();
    }
  }, [isOpen, idea.id]);

  if (!isOpen) return null;

  // Copy to clipboard
  const handleCopyMain = async () => {
    if (!promptText) return;
    await navigator.clipboard.writeText(promptText);
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2000);
  };

  const handleCopyTemplate = async (template: ReferenceTemplate) => {
    await navigator.clipboard.writeText(template.buildPrompt);
    setCopiedTemplateId(template.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  // Download plain-text file
  const handleDownloadTxt = () => {
    if (!promptText) return;
    const cleanName = idea.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `oddly-${cleanName}-build-prompt.txt`;
    const blob = new Blob([promptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <PipMascot mood={loading ? 'thinking' : 'talking'} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">APP-PROMPT MAKER</span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-700 font-mono">Google AI Studio Ready</span>
              </div>
              <h3 id="modal-title" className="font-display text-lg font-bold text-stone-900">
                Build: {idea.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <PipMascot mood="thinking" size="lg" className="mx-auto animate-pulse" />
              <div>
                <p className="font-display font-semibold text-stone-800 text-base">
                  Translating oddity into a concrete build spec...
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Assembling the 16 Google AI Studio sections, acceptance tests, and scope variants.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
              <p className="text-xs font-semibold text-rose-700">Prompt Formulation Stumbled</p>
              <p className="text-sm text-stone-700">{error}</p>
              <button
                onClick={fetchPrompt}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Formulation
              </button>
            </div>
          ) : (
            <>
              {/* Top Banner: Strict Builder Directive */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <FileCode2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-stone-900">Core Directive Embedded in Prompt:</p>
                  <p className="italic text-stone-700">
                    “Implement the complete core workflow before polishing the interface. Do not substitute mock data, fake success messages, placeholder buttons, or simulated AI responses for required functionality.”
                  </p>
                </div>
              </div>

              {/* Editable Prompt Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <label htmlFor="prompt-editor" className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy-Ready Build Prompt (16 Sections)</span>
                  </label>
                  <span className="text-[11px] text-stone-400">Editable before copying</span>
                </div>
                <textarea
                  id="prompt-editor"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={14}
                  className="w-full p-4 font-mono text-xs text-stone-800 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-y leading-relaxed"
                  placeholder="Generating build prompt..."
                />
              </div>

              {/* Reusable Reference Templates Section */}
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="text-xs font-bold text-stone-900">Reference Templates (3 Scope Variants)</span>
                      <p className="text-[11px] text-stone-500">Same idea adapted for: Tiny prototype, Paid pilot, or Unexpected twist</p>
                    </div>
                  </div>
                  {showTemplates ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                {showTemplates && (
                  <div className="p-4 pt-0 border-t border-stone-100 bg-[#FAF8F5]/50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                      {templates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                            selectedTemplateId === tpl.id
                              ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900">{tpl.title}</span>
                              <span className="text-[10px] text-stone-400 font-mono">Variant</span>
                            </div>
                            <p className="text-[11px] text-stone-600 italic">{tpl.tagline}</p>
                            
                            <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px]">
                              <div>
                                <strong className="text-stone-700">Changes:</strong> {tpl.whatChanges}
                              </div>
                              <div>
                                <strong className="text-stone-700">Stays:</strong> {tpl.whatStays}
                              </div>
                              <div>
                                <strong className="text-stone-700">Risk:</strong> {tpl.mainRisk}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedTemplateId(selectedTemplateId === tpl.id ? null : tpl.id)}
                              className="text-[11px] font-medium text-stone-600 hover:text-stone-900 underline"
                            >
                              {selectedTemplateId === tpl.id ? 'Hide prompt' : 'View prompt'}
                            </button>
                            <button
                              onClick={() => handleCopyTemplate(tpl)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md transition-colors flex items-center gap-1"
                            >
                              {copiedTemplateId === tpl.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-500" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded selected template prompt */}
                    {selectedTemplateId && (
                      <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-purple-950">
                          <span>
                            Build prompt for: {templates.find((t) => t.id === selectedTemplateId)?.title}
                          </span>
                          <button
                            onClick={() => setSelectedTemplateId(null)}
                            className="text-stone-400 hover:text-stone-700 text-xs"
                          >
                            Close
                          </button>
                        </div>
                        <pre className="p-3 bg-stone-50 text-[11px] font-mono text-stone-800 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48">
                          {templates.find((t) => t.id === selectedTemplateId)?.buildPrompt}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF8F5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tested for Google AI Studio single-workflow execution</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              onClick={handleDownloadTxt}
              disabled={loading || !promptText}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl shadow-2xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={handleCopyMain}
              disabled={loading || !promptText}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {copiedMain ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-300" />
                  <span>Copy build prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
