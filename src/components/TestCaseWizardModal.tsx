/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TestScenario, TrainingMission } from '../types/pipeline';
import {
  MISSION_PROMPT_INSPIRATIONS,
  generateTestScenarioFromPrompt,
} from '../engine/testCaseGenerator';
import {
  Sparkles,
  X,
  Play,
  Check,
  Copy,
  AlertCircle,
  FileCode2,
  Wand2,
  BookmarkPlus,
  RefreshCw,
  Layers,
  ShieldAlert,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface TestCaseWizardModalProps {
  mission: TrainingMission;
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: TestScenario, autoRun?: boolean) => void;
  onSaveScenario: (scenario: TestScenario) => void;
}

export const TestCaseWizardModal: React.FC<TestCaseWizardModalProps> = ({
  mission,
  isOpen,
  onClose,
  onApplyScenario,
  onSaveScenario,
}) => {
  const inspirations =
    MISSION_PROMPT_INSPIRATIONS[mission.id] ||
    MISSION_PROMPT_INSPIRATIONS.customer_triage;

  const [prompt, setPrompt] = useState<string>(inspirations[0]?.prompt || '');
  const [generationMode, setGenerationMode] = useState<
    'standard' | 'stress_test' | 'discrepancy'
  >('standard');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedScenario, setGeneratedScenario] = useState<TestScenario | null>(
    null
  );
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [scenarioLabel, setScenarioLabel] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Derive trigger schema fields from initialNodes trigger config or first scenario
  const sampleTriggerPayload =
    mission.initialNodes.find((n) => n.type === 'trigger')?.config?.samplePayload ||
    mission.testScenarios[0]?.payload ||
    {};
  const triggerKeys = Object.keys(sampleTriggerPayload);

  // Generate initial test case when modal opens or mission changes
  useEffect(() => {
    if (isOpen) {
      const defaultPrompt = inspirations[0]?.prompt || 'An urgent customer escalation';
      setPrompt(defaultPrompt);
      const initial = generateTestScenarioFromPrompt(
        defaultPrompt,
        mission,
        'standard'
      );
      setGeneratedScenario(initial);
      setScenarioLabel(initial.label);
      setRawJsonText(JSON.stringify(initial.payload, null, 2));
      setJsonError(null);
      setSavedSuccess(false);
    }
  }, [isOpen, mission.id]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateTestScenarioFromPrompt(
        prompt,
        mission,
        generationMode
      );
      setGeneratedScenario(result);
      setScenarioLabel(result.label);
      setRawJsonText(JSON.stringify(result.payload, null, 2));
      setJsonError(null);
      setIsGenerating(false);
      setSavedSuccess(false);
    }, 250);
  };

  const handleJsonChange = (text: string) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      if (generatedScenario) {
        setGeneratedScenario({
          ...generatedScenario,
          payload: parsed,
        });
      }
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFinalScenario = (): TestScenario => {
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(rawJsonText);
    } catch {
      parsedPayload = generatedScenario?.payload || {};
    }

    return {
      id: generatedScenario?.id || `scenario_custom_${Date.now()}`,
      label: scenarioLabel.trim() || 'Custom Test Scenario',
      description: `Generated from prompt: "${prompt.slice(0, 80)}"`,
      expectedCategory: generatedScenario?.expectedCategory,
      expectedOutcomeNotice: generatedScenario?.expectedOutcomeNotice,
      payload: parsedPayload,
    };
  };

  const handleApply = (autoRun: boolean) => {
    const finalScenario = getFinalScenario();
    onApplyScenario(finalScenario, autoRun);
    onClose();
  };

  const handleSave = () => {
    const finalScenario = getFinalScenario();
    onSaveScenario(finalScenario);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Test Case Wizard
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 rounded-full">
                  Natural Language to JSON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Targeting Mission:{' '}
                <span className="text-slate-200 font-medium">
                  {mission.title}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            aria-label="Close wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Trigger Schema Strip */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Expected Schema Keys:</span>
            <div className="flex flex-wrap gap-1.5">
              {triggerKeys.map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-700/60 rounded text-[11px] font-mono text-indigo-300"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Category: <strong className="text-slate-300">{mission.category}</strong>
          </span>
        </div>

        {/* Modal Main Body: 2-Column Responsive Split */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          {/* Left Column: Inspirations + Prompt Box (Cols 1-6) */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            {/* Preset Inspiration Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prompt Inspirations</span>
                </span>
                <span className="text-[10px] text-slate-400 lowercase font-normal">
                  click to autofill
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inspirations.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(item.prompt);
                      const modeMap: Record<string, 'standard' | 'stress_test' | 'discrepancy'> = {
                        urgent: 'stress_test',
                        discrepancy: 'discrepancy',
                        edge_case: 'stress_test',
                        standard: 'standard',
                      };
                      const nextMode = modeMap[item.tone] || 'standard';
                      setGenerationMode(nextMode);
                      const result = generateTestScenarioFromPrompt(
                        item.prompt,
                        mission,
                        nextMode
                      );
                      setGeneratedScenario(result);
                      setScenarioLabel(result.label);
                      setRawJsonText(JSON.stringify(result.payload, null, 2));
                      setJsonError(null);
                    }}
                    className="text-left p-2.5 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-600/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium border shrink-0 ${
                          item.tone === 'urgent'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                            : item.tone === 'discrepancy'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-2 flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="wizard-prompt"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <span>Describe your Test Scenario in Plain English</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              </div>

              <textarea
                id="wizard-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. An enterprise VIP client complaining that their automated sync stopped working after upgrading, threatening SLA breach unless fixed today..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all leading-relaxed"
              />

              {/* Mode selection + Generate Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setGenerationMode('standard')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      generationMode === 'standard'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerationMode('stress_test')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      generationMode === 'stress_test'
                        ? 'bg-rose-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Stress / Urgent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerationMode('discrepancy')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      generationMode === 'discrepancy'
                        ? 'bg-amber-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Discrepancy</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Generated Scenario & JSON Payload Editor (Cols 7-12) */}
          <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
            {/* Title & Category Bar */}
            <div className="space-y-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Scenario Label:
                </span>
                {generatedScenario?.expectedCategory && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/80 border border-indigo-700/40 text-indigo-300">
                    Category: {generatedScenario.expectedCategory}
                  </span>
                )}
              </div>

              <input
                type="text"
                value={scenarioLabel}
                onChange={(e) => setScenarioLabel(e.target.value)}
                placeholder="Scenario label"
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />

              {generatedScenario?.expectedOutcomeNotice && (
                <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 pt-0.5">
                  <span>🎯</span>
                  <span>Target: {generatedScenario.expectedOutcomeNotice}</span>
                </div>
              )}
            </div>

            {/* JSON Code Area */}
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-slate-300 text-xs">
                    Trigger Ingestion JSON
                  </span>
                  {jsonError ? (
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50 text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Syntax Error</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Valid Schema</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                  >
                    Format
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={rawJsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={11}
                className={`w-full flex-1 bg-slate-900/95 font-mono text-[11px] rounded-xl p-3 border leading-relaxed focus:outline-none transition-colors resize-none ${
                  jsonError
                    ? 'border-rose-500 text-rose-200'
                    : 'border-slate-800 text-slate-200 focus:border-indigo-500'
                }`}
              />
              {jsonError && (
                <p className="text-xs text-rose-400">{jsonError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/85 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={Boolean(jsonError)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Saved to Mission Scenarios!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Save to Mission Scenarios</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleApply(false)}
              disabled={Boolean(jsonError)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span>Apply as Active Scenario</span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              disabled={Boolean(jsonError)}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Apply & Run Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
