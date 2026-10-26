/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AutomationNode, NodeType, ContextVariableItem } from '../types/pipeline';
import { executeNode } from '../engine/pipelineEngine';
import {
  X,
  Play,
  Sparkles,
  Layers,
  Code2,
  Trash2,
  Check,
  AlertTriangle,
  Sliders,
  Terminal,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react';

interface NodeInspectorDrawerProps {
  node: AutomationNode | null;
  allNodes: AutomationNode[];
  onClose: () => void;
  onUpdateNode: (updatedNode: AutomationNode) => void;
  onDeleteNode: (nodeId: string) => void;
  globalContext: Record<string, any>;
  globalVariables?: ContextVariableItem[];
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  allNodes,
  onClose,
  onUpdateNode,
  onDeleteNode,
  globalContext,
  globalVariables,
}) => {
  if (!node) return null;

  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description);
  const [config, setConfig] = useState<any>({ ...node.config });
  const [isTestingSolo, setIsTestingSolo] = useState(false);
  const [soloTestOutput, setSoloTestOutput] = useState<any>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [showContextBrowser, setShowContextBrowser] = useState(false);

  // Available variable chips from upstream nodes
  const availableVariables = [
    '{{trigger.payload.senderName}}',
    '{{trigger.payload.senderEmail}}',
    '{{trigger.payload.subject}}',
    '{{trigger.payload.body}}',
    '{{node_classifier.output.category}}',
    '{{node_classifier.output.urgency}}',
    '{{node_extractor.output.totalAmount}}',
  ];

  const handleConfigChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateNode({
      ...node,
      title,
      description,
      config: updated,
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdateNode({
      ...node,
      title: newTitle,
      description,
      config,
    });
  };

  const handleInsertVariable = (varStr: string) => {
    const currentPrompt = config.userPromptTemplate || '';
    const updatedPrompt = currentPrompt + (currentPrompt ? '\n' : '') + varStr;
    handleConfigChange('userPromptTemplate', updatedPrompt);
    setCopiedVar(varStr);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const handleTestSolo = async () => {
    setIsTestingSolo(true);
    setSoloTestOutput(null);

    const testNode: AutomationNode = {
      ...node,
      title,
      description,
      config,
    };

    const result = await executeNode(testNode, globalContext);
    setSoloTestOutput(result);
    setIsTestingSolo(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity"
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Configure Node</h2>
          <span className="text-xs text-slate-500 font-mono">({node.type})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          aria-label="Close inspector drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
        {/* Node Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Node Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                onUpdateNode({ ...node, title, description: e.target.value, config });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* AI Node Configuration */}
        {(node.type === 'ai_classifier' ||
          node.type === 'ai_extractor' ||
          node.type === 'ai_generator') && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt Engineering & Model Config
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Zero-shot / Few-shot</span>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">System Instructions</label>
              <textarea
                value={config.systemPrompt || ''}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                placeholder="Define role, constraints, and JSON schema requirements..."
              />
            </div>

            {/* Variable insertion chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Quick Variable Chips:
                </span>
                <button
                  type="button"
                  onClick={() => setShowContextBrowser(!showContextBrowser)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium"
                >
                  <Database className="w-3 h-3" />
                  <span>
                    {showContextBrowser
                      ? 'Hide Context Explanations'
                      : `Browse All (${globalVariables?.length || 0}) with Explanations`}
                  </span>
                  {showContextBrowser ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {availableVariables.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleInsertVariable(v)}
                    type="button"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded font-mono text-[10px] transition-colors border border-slate-700/60"
                  >
                    {v}
                  </button>
                ))}
              </div>
              {copiedVar && (
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Inserted {copiedVar}
                </div>
              )}

              {/* Expandable Full Global Context Browser with Demo Explanations */}
              {showContextBrowser && globalVariables && (
                <div className="mt-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 max-h-56 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>Available Data Keys &amp; Explanations:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Click Insert to add to prompt</span>
                  </div>

                  <div className="space-y-2">
                    {globalVariables.map((gv) => (
                      <div
                        key={gv.key}
                        className="p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-indigo-300 font-bold">
                            {gv.templateTag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleInsertVariable(gv.templateTag)}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            Insert
                          </button>
                        </div>
                        <div className="text-slate-300 text-[10px] leading-tight">
                          {gv.demoExplanation}
                        </div>
                        <div className="text-emerald-400/90 font-mono text-[10px] truncate">
                          Live Value: {typeof gv.currentValue === 'object' ? JSON.stringify(gv.currentValue) : String(gv.currentValue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Prompt Template */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Prompt Template (Interpolates Variables)
              </label>
              <textarea
                value={config.userPromptTemplate || ''}
                onChange={(e) => handleConfigChange('userPromptTemplate', e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                placeholder="Combine instructions with {{variables}}..."
              />
            </div>

            {/* Model & Temperature */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Engine</label>
                <select
                  value={config.model || 'gemini-2.5-flash'}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep)</option>
                  <option value="simulated-llm">Deterministic Engine (Offline)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Temperature</span>
                  <span className="font-mono">{config.temperature ?? 0.2}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature ?? 0.2}
                  onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Output format */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Output Structure</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleConfigChange('outputFormat', 'json')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    config.outputFormat === 'json'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Structured JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleConfigChange('outputFormat', 'text')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    config.outputFormat === 'text'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Freeform Prose Text
                </button>
              </div>
            </div>

            {/* Interactive Node Sandbox */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prompt Sandbox & Dry Run</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestSolo}
                  disabled={isTestingSolo}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isTestingSolo ? 'Simulating...' : 'Test Node Solo'}</span>
                </button>
              </div>

              {soloTestOutput && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>STATUS: {soloTestOutput.status.toUpperCase()}</span>
                    <span>
                      {soloTestOutput.latencyMs}ms · {soloTestOutput.tokensUsed} tokens
                    </span>
                  </div>
                  <pre className="bg-slate-900 rounded p-2 text-[11px] font-mono text-emerald-300 max-h-40 overflow-y-auto">
                    {JSON.stringify(soloTestOutput.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Condition Node Configuration */}
        {node.type === 'condition' && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <span className="font-semibold text-emerald-300">Router Logic Rules</span>
            <div>
              <label className="block text-slate-400 mb-1">Variable Path to Evaluate</label>
              <input
                type="text"
                value={config.variablePath || ''}
                onChange={(e) => handleConfigChange('variablePath', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                placeholder="node_classifier.output.category"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Operator</label>
                <select
                  value={config.operator || 'equals'}
                  onChange={(e) => handleConfigChange('operator', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Does Not Equal</option>
                  <option value="contains">Contains Substring</option>
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="less_than">Less Than (&lt;)</option>
                  <option value="in">In Comma List</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Value</label>
                <input
                  type="text"
                  value={config.targetValue || ''}
                  onChange={(e) => handleConfigChange('targetValue', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  placeholder="e.g. billing_refund"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Node Configuration */}
        {(node.type === 'action_email' ||
          node.type === 'action_webhook' ||
          node.type === 'action_database') && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <span className="font-semibold text-blue-300">Dispatch Destination & Payload</span>
            <div>
              <label className="block text-slate-400 mb-1">Target Endpoint / Recipient</label>
              <input
                type="text"
                value={config.destination || ''}
                onChange={(e) => handleConfigChange('destination', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                placeholder="https://api.domain.com/webhook or email address"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
    </>
  );
};
