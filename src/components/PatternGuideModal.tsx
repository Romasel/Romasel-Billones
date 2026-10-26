/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AUTOMATION_PATTERNS } from '../data/cheatsheet';
import { BookOpen, Copy, Check, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';

interface PatternGuideModalProps {
  onClose: () => void;
}

export const PatternGuideModal: React.FC<PatternGuideModalProps> = ({ onClose }) => {
  const [selectedPatternId, setSelectedPatternId] = useState(AUTOMATION_PATTERNS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedPattern =
    AUTOMATION_PATTERNS.find((p) => p.id === selectedPatternId) || AUTOMATION_PATTERNS[0];

  const handleCopyPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>AI Automation Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production AI Automation Architecture Patterns
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Master the industry standard recipes used by senior AI automation engineers to build resilient, hallucination-resistant pipelines.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Pattern Navigation List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Core Design Patterns:
            </div>
            {AUTOMATION_PATTERNS.map((p) => {
              const isSelected = p.id === selectedPattern.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatternId(p.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.summary}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pattern Deep Dive Panel */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedPattern.name}</h2>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {selectedPattern.summary}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>When To Implement This Pattern</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPattern.whenToUse}
              </p>
            </div>

            {/* Prompt Template Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Production Prompt Template:
                </span>
                <button
                  onClick={() =>
                    handleCopyPrompt(selectedPattern.promptExample, selectedPattern.id)
                  }
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  {copiedId === selectedPattern.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === selectedPattern.id ? 'Copied to Clipboard' : 'Copy Template'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed border border-slate-800">
                {selectedPattern.promptExample}
              </pre>
            </div>

            {/* Engineering Golden Rule */}
            <div className="p-3.5 bg-indigo-950/30 rounded-xl border border-indigo-800/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-300">Engineering Golden Rule</div>
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {selectedPattern.keyRule}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
