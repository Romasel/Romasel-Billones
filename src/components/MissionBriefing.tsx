/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrainingMission, TestScenario } from '../types/pipeline';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Sparkles,
} from 'lucide-react';

interface MissionBriefingProps {
  mission: TrainingMission;
  activeScenario: TestScenario;
  onSelectScenario: (scenario: TestScenario) => void;
  objectiveResults: Record<string, boolean>;
  allObjectivesMet: boolean;
  onPayloadChange: (newPayload: Record<string, any>) => void;
  onOpenWizard?: () => void;
}

export const MissionBriefing: React.FC<MissionBriefingProps> = ({
  mission,
  activeScenario,
  onSelectScenario,
  objectiveResults,
  allObjectivesMet,
  onPayloadChange,
  onOpenWizard,
}) => {
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(activeScenario.payload, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync when activeScenario changes
  React.useEffect(() => {
    setPayloadText(JSON.stringify(activeScenario.payload, null, 2));
    setJsonError(null);
  }, [activeScenario]);

  const handleJsonUpdate = (text: string) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      onPayloadChange(parsed);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-between">
        {/* Left Column: Mission Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
              {mission.category}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400 font-medium">Difficulty: {mission.difficulty}</span>
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">{mission.title}</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{mission.description}</p>

          {/* Objectives Checkpoints */}
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Mission Objectives:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {mission.objectives.map((obj) => {
                const passed = objectiveResults[obj.id];
                return (
                  <div
                    key={obj.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                      passed
                        ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{obj.title}</div>
                      <div className="text-slate-400 text-[11px] leading-tight mt-0.5">{obj.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Test Scenario Switcher */}
        <div className="w-full lg:w-96 bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <FlaskConical className="w-4 h-4 text-indigo-400" />
              <span>Select Test Input Scenario</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenWizard && (
                <button
                  onClick={onOpenWizard}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-md border border-indigo-400/30 flex items-center gap-1 shadow-sm transition-all animate-pulse"
                  title="Generate sample JSON payload using natural language"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>AI Wizard</span>
                </button>
              )}
              <button
                onClick={() => setIsPayloadExpanded(!isPayloadExpanded)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isPayloadExpanded ? 'Hide' : 'View'}</span>
                {isPayloadExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="space-y-1.5">
            {mission.testScenarios.map((sc) => {
              const isActive = sc.id === activeScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-all border ${
                    isActive
                      ? 'bg-indigo-900/40 border-indigo-500/60 text-white font-medium shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-200">{sc.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sc.description}</div>
                  {sc.expectedOutcomeNotice && (
                    <div className="text-[10px] text-indigo-300/80 mt-1">
                      Target: {sc.expectedOutcomeNotice}
                    </div>
                  )}
                </button>
              );
            })}

            {onOpenWizard && (
              <button
                onClick={onOpenWizard}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-indigo-700/50 hover:border-indigo-500 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 hover:text-indigo-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all group mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>+ Generate Scenario with Wizard</span>
              </button>
            )}
          </div>

          {/* Expandable JSON Payload Editor */}
          {isPayloadExpanded && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Trigger Ingestion JSON</span>
                {jsonError ? (
                  <span className="text-red-400">Invalid JSON syntax</span>
                ) : (
                  <span className="text-emerald-400">Valid Schema</span>
                )}
              </div>
              <textarea
                value={payloadText}
                onChange={(e) => handleJsonUpdate(e.target.value)}
                rows={6}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
