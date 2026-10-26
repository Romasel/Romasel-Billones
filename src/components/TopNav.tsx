/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, RotateCcw, BookOpen, Layers, Share2 } from 'lucide-react';

interface TopNavProps {
  activeView: 'canvas' | 'guide' | 'python_bots';
  setActiveView: (view: 'canvas' | 'guide' | 'python_bots') => void;
  onRunPipeline: () => void;
  onResetPipeline: () => void;
  onShareWorkflow?: () => void;
  isRunning: boolean;
  totalTokens: number;
  totalDurationMs: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  setActiveView,
  onRunPipeline,
  onResetPipeline,
  onShareWorkflow,
  isRunning,
  totalTokens,
  totalDurationMs,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#canvas"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('canvas');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>AutoTrain AI</span>
        </a>
        <span className="text-xs text-slate-400 border-l border-slate-800 pl-3 hidden sm:inline">
          Hands-on Automation Training Lab
        </span>
      </div>

      {/* Zone 2: Clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveView('canvas')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'canvas' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Workflow Canvas</span>
        </button>

        <button
          onClick={() => setActiveView('python_bots')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'python_bots' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          <span className="text-amber-400 font-mono font-bold text-xs">{'{py}'}</span>
          <span>Python & ML Bots Studio</span>
        </button>

        <button
          onClick={() => setActiveView('guide')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'guide' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Automation Patterns Guide</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {totalTokens > 0 && (
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 pr-2 font-mono tabular-nums">
            <span>{totalTokens} tokens</span>
            <span aria-hidden="true">·</span>
            <span>{totalDurationMs}ms</span>
          </div>
        )}

        {onShareWorkflow && (
          <button
            onClick={onShareWorkflow}
            title="Share pipeline configuration via query URL"
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 flex items-center gap-1.5"
            aria-label="Share automation workflow"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        <button
          onClick={onResetPipeline}
          disabled={isRunning}
          title="Reset pipeline execution state"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
          aria-label="Reset execution results"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRunPipeline}
          disabled={isRunning}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm ${
            isRunning
              ? 'bg-indigo-700/60 text-indigo-200 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          } whitespace-nowrap shrink-0`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Executing Pipeline...' : 'Run Automation'}</span>
        </button>
      </div>
    </header>
  );
};
