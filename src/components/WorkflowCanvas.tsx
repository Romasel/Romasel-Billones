/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AutomationNode, NodeType } from '../types/pipeline';
import {
  Zap,
  Brain,
  GitBranch,
  FileText,
  Mail,
  Database,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  Settings,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wand2,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: AutomationNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onAddNode: () => void;
  isRunning: boolean;
  onRunPipeline: () => void;
  onStepDebug: () => void;
  onExportJson: () => void;
  onOpenWizard?: () => void;
  onShareWorkflow?: () => void;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.15;

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  isRunning,
  onRunPipeline,
  onStepDebug,
  onExportJson,
  onOpenWizard,
  onShareWorkflow,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  const handleFitToView = useCallback(() => {
    if (!canvasViewportRef.current || !contentRef.current) return;
    const viewport = canvasViewportRef.current;
    const content = contentRef.current;

    // Available viewport size minus padding
    const availableWidth = viewport.clientWidth - 80;
    const availableHeight = viewport.clientHeight - 80;

    // Approximate natural unscaled dimensions of pipeline nodes
    // w-72 (288px) per node + 36px connector between nodes
    const estimatedContentWidth = nodes.length * 288 + Math.max(0, nodes.length - 1) * 36;
    const estimatedContentHeight = 260;

    const actualWidth = content.scrollWidth > 0 ? content.scrollWidth / (zoom || 1) : estimatedContentWidth;
    const actualHeight = content.scrollHeight > 0 ? content.scrollHeight / (zoom || 1) : estimatedContentHeight;

    const widthToUse = Math.max(actualWidth, estimatedContentWidth);
    const heightToUse = Math.max(actualHeight, estimatedContentHeight);

    const scaleX = availableWidth / widthToUse;
    const scaleY = availableHeight / heightToUse;

    // Cap at 1.0 (never upscale unnecessarily beyond 100% on small pipelines)
    const targetScale = Math.min(1.0, Math.max(MIN_ZOOM, Math.min(scaleX, scaleY) * 0.95));

    setZoom(Math.round(targetScale * 100) / 100);

    // Scroll canvas to center
    setTimeout(() => {
      if (viewport) {
        viewport.scrollTo({
          left: (viewport.scrollWidth - viewport.clientWidth) / 2,
          top: (viewport.scrollHeight - viewport.clientHeight) / 2,
          behavior: 'smooth',
        });
      }
    }, 50);
  }, [nodes.length, zoom]);

  // Keyboard shortcut support: Ctrl + / Ctrl - / Ctrl 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'trigger':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'ai_classifier':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'ai_extractor':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'ai_generator':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'condition':
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case 'action_email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'action_database':
        return <Database className="w-4 h-4 text-rose-400" />;
      default:
        return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeTypeLabel = (type: NodeType) => {
    switch (type) {
      case 'trigger':
        return 'TRIGGER EVENT';
      case 'ai_classifier':
        return 'AI CLASSIFIER';
      case 'ai_extractor':
        return 'AI EXTRACTOR';
      case 'ai_generator':
        return 'AI GENERATOR';
      case 'condition':
        return 'ROUTER LOGIC';
      case 'action_email':
        return 'DISPATCH ACTION';
      case 'action_database':
        return 'DATABASE UPSERT';
      default:
        return 'AUTOMATION STEP';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 canvas-dots relative overflow-hidden">
      {/* Canvas Top Bar Controls */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Pipeline Architecture ({nodes.length} Nodes)
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any node to inspect system prompt, schemas & variables
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom In/Out & Fit to View Controls */}
          <div className="flex items-center bg-slate-950/90 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
              title="Zoom out (Ctrl -)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono font-medium text-slate-300 hover:text-indigo-400 transition-colors tabular-nums"
              title="Reset zoom to 100% (Ctrl 0)"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
              title="Zoom in (Ctrl +)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

            <button
              onClick={handleFitToView}
              className="px-2 py-0.5 text-[11px] text-indigo-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition-colors font-medium"
              title="Fit entire pipeline to view"
              aria-label="Fit to View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Fit to View</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800 mx-0.5 hidden sm:block" />

          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 text-indigo-200 hover:text-white rounded-lg flex items-center gap-1.5 transition-all border border-indigo-500/40 shadow-sm"
              title="Open AI Test Case Wizard to generate sample payloads"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Test Case Wizard</span>
            </button>
          )}

          <button
            onClick={onAddNode}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            onClick={onStepDebug}
            disabled={isRunning}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Step Debug</span>
          </button>

          {onShareWorkflow && (
            <button
              onClick={onShareWorkflow}
              title="Share pipeline configuration via query URL"
              className="px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 rounded-lg transition-colors border border-indigo-800/60 flex items-center gap-1.5"
              aria-label="Share pipeline"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={onExportJson}
            title="Export workflow schema"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            aria-label="Export Pipeline JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div
        ref={canvasViewportRef}
        className="flex-1 overflow-auto p-8 flex items-center justify-center relative select-none"
      >
        <div
          ref={contentRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-wrap lg:flex-nowrap items-center gap-6 max-w-full justify-center"
        >
          {nodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId;
            const hasResult = Boolean(node.executionResult);
            const status = node.status;

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  onClick={() => onSelectNode(node.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Configure ${node.title}`}
                  className={`w-72 bg-slate-900/90 rounded-xl p-4 cursor-pointer transition-all border relative group text-left ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  } ${
                    status === 'running'
                      ? 'ring-2 ring-amber-500/50 border-amber-500'
                      : ''
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-800/90 border border-slate-700/60">
                        {getNodeIcon(node.type)}
                      </div>
                      <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                        {getNodeTypeLabel(node.type)}
                      </span>
                    </div>

                    {status === 'running' && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Running
                      </span>
                    )}
                    {status === 'success' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                    {status === 'skipped' && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        Skipped Branch
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="text-[11px] text-rose-400 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {node.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>

                  {/* Output Preview summary chip if executed */}
                  {hasResult && node.executionResult && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                        <span>Output:</span>
                        <span className="tabular-nums">
                          {node.executionResult.latencyMs}ms · {node.executionResult.tokensUsed} tok
                        </span>
                      </div>
                      <div className="bg-slate-950 rounded p-1.5 text-[11px] font-mono text-slate-300 truncate">
                        {(() => {
                          const out = node.executionResult.output;
                          if (out === null || out === undefined) return 'null';
                          if (typeof out === 'string') return out;
                          if (typeof out === 'number' || typeof out === 'boolean') return String(out);
                          if (React.isValidElement(out)) return '[Rendered Element]';
                          try {
                            return JSON.stringify(out);
                          } catch {
                            return String(out);
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Settings quick hint */}
                  <div className="mt-2 flex items-center justify-end text-[11px] text-slate-500 group-hover:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      Configure
                    </span>
                  </div>
                </div>

                {/* Arrow Connector between nodes */}
                {index < nodes.length - 1 && (
                  <div className="hidden lg:flex items-center text-slate-600 shrink-0">
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Floating Canvas Controls Widget */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom out"
          aria-label="Zoom out floating"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetZoom}
          className="px-2 py-1 text-[11px] font-mono font-medium text-slate-300 hover:text-indigo-400 transition-colors tabular-nums"
          title="Click to reset zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom in"
          aria-label="Zoom in floating"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          onClick={handleFitToView}
          className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
          title="Fit pipeline to view"
          aria-label="Fit to View floating"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fit to View</span>
        </button>
      </div>
    </div>
  );
};
