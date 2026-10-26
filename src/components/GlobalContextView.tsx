/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContextVariableItem } from '../types/pipeline';
import {
  Copy,
  Check,
  Search,
  Code2,
  Info,
  Layers,
  Sparkles,
  Zap,
  Lightbulb,
  Tag,
  Database,
  Terminal,
} from 'lucide-react';

interface GlobalContextViewProps {
  variables: ContextVariableItem[];
  onInsertVariable?: (templateTag: string) => void;
}

export const GlobalContextView: React.FC<GlobalContextViewProps> = ({
  variables,
  onInsertVariable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'trigger' | 'ai' | 'action'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyTag = (tag: string, key: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredVariables = variables.filter((v) => {
    const matchesSearch =
      v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.templateTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sourceNodeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.demoExplanation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterSource === 'trigger') return v.sourceNodeType === 'trigger';
    if (filterSource === 'ai') return v.sourceNodeType.startsWith('ai_');
    if (filterSource === 'action') return v.sourceNodeType.startsWith('action_') || v.sourceNodeType === 'condition';

    return true;
  });

  const triggerVarCount = variables.filter((v) => v.sourceNodeType === 'trigger').length;
  const downstreamVarCount = variables.length - triggerVarCount;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
      {/* Educational Banner */}
      <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Global Pipeline Context & Dynamic Variables</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          In automated AI pipelines, data flows downstream from triggers and early nodes. Reference any variable key below by typing <code className="text-indigo-300 font-mono">{'{{variable.path}}'}</code> directly into your prompts, conditional routers, or action payloads.
        </p>
      </div>

      {/* Search & Source Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search variables (e.g. senderName, category, total)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
          />
        </div>

        {/* Source Filter Tabs */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filterSource === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({variables.length})
            </button>
            <button
              onClick={() => setFilterSource('trigger')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filterSource === 'trigger'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Triggers ({triggerVarCount})
            </button>
            <button
              onClick={() => setFilterSource('ai')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filterSource === 'ai'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Outputs ({downstreamVarCount})
            </button>
          </div>

          <span className="text-slate-500 font-mono text-[10px]">
            {filteredVariables.length} Keys Shown
          </span>
        </div>
      </div>

      {/* Variables List */}
      <div className="space-y-3">
        {filteredVariables.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No variables matched your search filter.
          </div>
        ) : (
          filteredVariables.map((item) => (
            <div
              key={item.key}
              className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3.5 space-y-2.5 transition-all hover:border-slate-700"
            >
              {/* Variable Header & Tag */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/40 px-2 py-0.5 rounded">
                      {item.templateTag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({item.dataType})
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="text-slate-500">Source:</span>
                    <span className="text-slate-300 font-medium">
                      {item.sourceNodeTitle}
                    </span>
                  </div>
                </div>

                {/* Copy Tag Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onInsertVariable && (
                    <button
                      onClick={() => onInsertVariable(item.templateTag)}
                      className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded font-medium transition-colors"
                      title="Insert tag into prompt editor"
                    >
                      Insert
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyTag(item.templateTag, item.key)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                    title="Copy {{tag}} to clipboard"
                    aria-label={`Copy ${item.templateTag}`}
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px]">
                      {copiedKey === item.key ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Live Current / Sample Value */}
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-850 font-mono text-[11px]">
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                  Current Pipeline Value:
                </div>
                <div className="text-emerald-300 break-all line-clamp-3">
                  {typeof item.currentValue === 'object'
                    ? JSON.stringify(item.currentValue)
                    : String(item.currentValue)}
                </div>
              </div>

              {/* Demo Explanation */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1 text-slate-400 font-semibold">
                  <Info className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Demo Explanation:</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-4">
                  {item.demoExplanation}
                </p>
              </div>

              {/* Prompt Usage Tip */}
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-start gap-2 text-[11px]">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <span className="font-semibold text-amber-300/90">Prompt Tip: </span>
                  {item.promptUsageTip}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
