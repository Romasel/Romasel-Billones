/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  Layers,
  FlaskConical,
  Sparkles,
  Link2,
} from 'lucide-react';
import { AutomationNode, TestScenario } from '../types/pipeline';
import { buildShareUrl, WorkflowSharePayload } from '../utils/shareUrl';

interface ShareWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  missionTitle: string;
  nodes: AutomationNode[];
  scenarios: TestScenario[];
  activeScenarioId?: string;
}

export const ShareWorkflowModal: React.FC<ShareWorkflowModalProps> = ({
  isOpen,
  onClose,
  missionId,
  missionTitle,
  nodes,
  scenarios,
  activeScenarioId,
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const payload: WorkflowSharePayload = {
          v: 1,
          missionId,
          missionTitle,
          nodes,
          scenarios,
          activeScenarioId,
          createdAt: Date.now(),
        };
        const url = buildShareUrl(payload);
        setShareUrl(url);
        setCopied(false);
      } catch (e) {
        console.error('Error generating share link:', e);
      }
    }
  }, [isOpen, missionId, missionTitle, nodes, scenarios, activeScenarioId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input') as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-white tracking-tight">
                Share Automation Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Generate an instant, self-contained URL encoding your nodes and scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Summary Badges */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Included in this Shareable Configuration:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {missionTitle}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-mono">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {nodes.length} Configured Nodes
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-mono">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                {scenarios.length} Test Scenarios
              </span>
            </div>
          </div>

          {/* Shareable Link Input */}
          <div className="space-y-2">
            <label
              htmlFor="share-url-input"
              className="text-xs font-medium text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                Shareable Link (Query Encoded)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {shareUrl.length} chars
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-200 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-xs text-indigo-200/90 leading-relaxed">
            <p className="font-semibold text-indigo-300 mb-1">
              ⚡ How workflow sharing works:
            </p>
            <p className="text-slate-300 text-[12px]">
              The entire automation graph (node prompts, temperatures, condition branch expressions, and custom synthesized test scenarios) is compressed into the URL query parameters. Anyone opening this link will immediately load your custom pipeline ready to execute.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleOpenLink}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link in New Tab</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
