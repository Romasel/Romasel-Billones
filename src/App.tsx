/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TRAINING_MISSIONS } from './data/missions';
import {
  AutomationNode,
  TestScenario,
  StepTrace,
  NodeExecutionResult,
  PipelineRunHistoryItem,
} from './types/pipeline';
import { runPipeline, evaluateObjectives, executeNode } from './engine/pipelineEngine';
import { extractGlobalContextVariables } from './utils/contextExtractor';
import { TopNav } from './components/TopNav';
import { MissionSelector } from './components/MissionSelector';
import { MissionBriefing } from './components/MissionBriefing';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeInspectorDrawer } from './components/NodeInspectorDrawer';
import { ExecutionInspector } from './components/ExecutionInspector';
import { PatternGuideModal } from './components/PatternGuideModal';
import { PythonBotsStudio } from './components/PythonBotsStudio';
import { TestCaseWizardModal } from './components/TestCaseWizardModal';
import { ShareWorkflowModal } from './components/ShareWorkflowModal';
import { getSharedWorkflowFromUrl } from './utils/shareUrl';
import { Link2, X } from 'lucide-react';

export default function App() {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    TRAINING_MISSIONS[0].id
  );
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(
    new Set()
  );
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sharedBanner, setSharedBanner] = useState<{
    message: string;
    nodeCount: number;
    scenarioCount: number;
  } | null>(null);
  const [customScenariosMap, setCustomScenariosMap] = useState<
    Record<string, TestScenario[]>
  >({});

  const activeMission =
    TRAINING_MISSIONS.find((m) => m.id === selectedMissionId) ||
    TRAINING_MISSIONS[0];

  const allScenariosForMission = [
    ...activeMission.testScenarios,
    ...(customScenariosMap[activeMission.id] || []),
  ];

  const currentMissionWithScenarios = {
    ...activeMission,
    testScenarios: allScenariosForMission,
  };

  const [nodes, setNodes] = useState<AutomationNode[]>(
    JSON.parse(JSON.stringify(activeMission.initialNodes))
  );
  const [activeScenario, setActiveScenario] = useState<TestScenario>(
    activeMission.testScenarios[0]
  );
  const [triggerPayload, setTriggerPayload] = useState<Record<string, any>>(
    activeMission.testScenarios[0].payload
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'canvas' | 'guide' | 'python_bots'>('canvas');

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [traces, setTraces] = useState<StepTrace[]>([]);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(0);
  const [objectiveResults, setObjectiveResults] = useState<Record<string, boolean>>(
    {}
  );
  const [allObjectivesMet, setAllObjectivesMet] = useState<boolean>(false);
  const [currentDebugStepIndex, setCurrentDebugStepIndex] = useState<number>(0);

  // Historical Pipeline Runs Log for Recharts Visualization (tracking last 10 runs & latencyMs bottlenecks)
  const [runHistory, setRunHistory] = useState<PipelineRunHistoryItem[]>([
    {
      runId: 'run-seed-1',
      runNumber: 1,
      missionTitle: 'Customer Support Triage',
      timestamp: '03:01:10',
      durationMs: 760,
      latencyMs: 760,
      tokensUsed: 395,
      nodeCount: 5,
      status: 'success',
      slowestNode: {
        nodeId: 'ai-classifier',
        title: 'AI Intent Classifier',
        nodeType: 'ai_classifier',
        latencyMs: 520,
        percentage: 68,
      },
    },
    {
      runId: 'run-seed-2',
      runNumber: 2,
      missionTitle: 'Customer Support Triage',
      timestamp: '03:03:45',
      durationMs: 830,
      latencyMs: 830,
      tokensUsed: 410,
      nodeCount: 5,
      status: 'success',
      slowestNode: {
        nodeId: 'ai-classifier',
        title: 'AI Intent Classifier',
        nodeType: 'ai_classifier',
        latencyMs: 580,
        percentage: 70,
      },
    },
    {
      runId: 'run-seed-3',
      runNumber: 3,
      missionTitle: 'Customer Support Triage',
      timestamp: '03:05:22',
      durationMs: 879,
      latencyMs: 879,
      tokensUsed: 430,
      nodeCount: 5,
      status: 'success',
      slowestNode: {
        nodeId: 'ai-classifier',
        title: 'AI Intent Classifier',
        nodeType: 'ai_classifier',
        latencyMs: 640,
        percentage: 73,
      },
    },
  ]);

  // When changing missions, reload initial nodes and scenarios
  const handleSelectMission = (missionId: string) => {
    const mission = TRAINING_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;
    setSelectedMissionId(missionId);
    setNodes(JSON.parse(JSON.stringify(mission.initialNodes)));
    const customs = customScenariosMap[missionId] || [];
    const allScenarios = [...mission.testScenarios, ...customs];
    setActiveScenario(allScenarios[0]);
    setTriggerPayload(allScenarios[0].payload);
    setTraces([]);
    setTotalTokens(0);
    setTotalDurationMs(0);
    setObjectiveResults({});
    setAllObjectivesMet(false);
    setSelectedNodeId(null);
    setCurrentDebugStepIndex(0);
  };

  const handleSelectScenario = (sc: TestScenario) => {
    setActiveScenario(sc);
    setTriggerPayload(sc.payload);
  };

  const handleApplyScenario = (scenario: TestScenario, autoRun = false) => {
    setActiveScenario(scenario);
    setTriggerPayload(scenario.payload);
    setNodes((prev) =>
      prev.map((n) =>
        n.type === 'trigger'
          ? {
              ...n,
              config: {
                ...n.config,
                samplePayload: scenario.payload,
              },
            }
          : n
      )
    );
    if (autoRun) {
      setTimeout(() => {
        handleRunPipeline(scenario.payload);
      }, 60);
    }
  };

  const handleSaveScenario = (scenario: TestScenario) => {
    setCustomScenariosMap((prev) => {
      const existing = prev[activeMission.id] || [];
      const filtered = existing.filter((s) => s.id !== scenario.id);
      return {
        ...prev,
        [activeMission.id]: [...filtered, scenario],
      };
    });
    setActiveScenario(scenario);
    setTriggerPayload(scenario.payload);
  };

  // Run full automated pipeline
  const handleRunPipeline = async (overridePayload?: Record<string, any>) => {
    if (isRunning) return;
    setIsRunning(true);
    setTraces([]);

    const payloadToRun = overridePayload || triggerPayload;

    // Reset nodes to idle first
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'idle',
        executionResult: undefined,
      }))
    );

    const stepTraces: StepTrace[] = [];

    const result = await runPipeline(nodes, payloadToRun, (trace) => {
      stepTraces.push(trace);
      setTraces([...stepTraces]);

      // Update node status as it executes
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === trace.nodeId) {
            return {
              ...n,
              status: trace.status === 'success' ? 'success' : 'error',
              executionResult: {
                input: trace.input,
                output: trace.output,
                latencyMs: trace.latencyMs,
                tokensUsed: trace.tokensUsed,
                status: trace.status === 'success' ? 'success' : 'error',
                timestamp: trace.timestamp,
              },
            };
          }
          return n;
        })
      );
    });

    // Mark any nodes that were not executed in this run as 'skipped'
    const executedNodeIds = new Set(result.traces.map((t) => t.nodeId));
    setNodes((prev) =>
      prev.map((n) => {
        if (!executedNodeIds.has(n.id)) {
          return {
            ...n,
            status: 'skipped',
            executionResult: undefined,
          };
        }
        return n;
      })
    );

    setTotalTokens(result.totalTokens);
    setTotalDurationMs(result.totalDurationMs);

    // Identify slowest bottleneck node in this execution run
    const slowestTrace = result.traces.reduce<StepTrace | null>((max, t) => {
      if (!max || t.latencyMs > max.latencyMs) return t;
      return max;
    }, null);

    const slowestNode = slowestTrace
      ? {
          nodeId: slowestTrace.nodeId,
          title: slowestTrace.nodeTitle,
          nodeType: slowestTrace.nodeType,
          latencyMs: slowestTrace.latencyMs,
          percentage:
            result.totalDurationMs > 0
              ? Math.round((slowestTrace.latencyMs / result.totalDurationMs) * 100)
              : 0,
        }
      : undefined;

    // Record execution run in historical log for Recharts chart (plots latencyMs over last 10 runs)
    const newRunItem: PipelineRunHistoryItem = {
      runId: `run-${Date.now()}`,
      runNumber: runHistory.length + 1,
      missionTitle: activeMission.title,
      timestamp: new Date().toLocaleTimeString(),
      durationMs: result.totalDurationMs,
      latencyMs: result.totalDurationMs,
      tokensUsed: result.totalTokens,
      nodeCount: result.traces.length,
      status: result.success ? 'success' : 'error',
      slowestNode,
    };
    setRunHistory((prev) => [...prev, newRunItem]);

    // Evaluate objectives
    const { objectiveResults: objRes, allPassed } = evaluateObjectives(
      activeMission.objectives,
      result.nodeResults,
      { trigger: { payload: payloadToRun } }
    );

    setObjectiveResults(objRes);
    setAllObjectivesMet(allPassed);

    if (allPassed) {
      setCompletedMissionIds((prev) => new Set([...prev, activeMission.id]));
    }

    setIsRunning(false);
  };

  // Step-by-Step Debug Execution
  const handleStepDebug = async () => {
    if (isRunning) return;
    if (currentDebugStepIndex >= nodes.length) {
      setCurrentDebugStepIndex(0);
      handleResetPipeline();
      return;
    }

    const currentNode = nodes[currentDebugStepIndex];
    if (!currentNode) return;

    setIsRunning(true);
    // Mark current node running
    setNodes((prev) =>
      prev.map((n) => (n.id === currentNode.id ? { ...n, status: 'running' } : n))
    );

    // Build context up to this point
    const context: Record<string, any> = {
      trigger: { payload: triggerPayload },
    };
    for (const t of traces) {
      context[t.nodeId] = { input: t.input, output: t.output };
    }

    const result = await executeNode(currentNode, context);

    const trace: StepTrace = {
      stepNumber: traces.length + 1,
      nodeId: currentNode.id,
      nodeTitle: currentNode.title,
      nodeType: currentNode.type,
      status: result.status,
      input: result.input,
      output: result.output,
      latencyMs: result.latencyMs,
      tokensUsed: result.tokensUsed,
      logMessage: `Step ${currentDebugStepIndex + 1} completed: ${currentNode.title}`,
      timestamp: result.timestamp,
    };

    const newTraces = [...traces, trace];
    setTraces(newTraces);
    setTotalTokens((prev) => prev + result.tokensUsed);
    setTotalDurationMs((prev) => prev + result.latencyMs);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === currentNode.id
          ? {
              ...n,
              status: result.status === 'success' ? 'success' : 'error',
              executionResult: result,
            }
          : n
      )
    );

    const nextIndex = currentDebugStepIndex + 1;
    setCurrentDebugStepIndex(nextIndex);

    // If last step, evaluate objectives
    if (nextIndex >= nodes.length) {
      const nodeResults: Record<string, NodeExecutionResult> = {};
      for (const t of newTraces) {
        nodeResults[t.nodeId] = {
          input: t.input,
          output: t.output,
          latencyMs: t.latencyMs,
          tokensUsed: t.tokensUsed,
          status: t.status === 'success' ? 'success' : 'error',
          timestamp: t.timestamp,
        };
      }
      const { objectiveResults: objRes, allPassed } = evaluateObjectives(
        activeMission.objectives,
        nodeResults,
        context
      );
      setObjectiveResults(objRes);
      setAllObjectivesMet(allPassed);
      if (allPassed) {
        setCompletedMissionIds((prev) => new Set([...prev, activeMission.id]));
      }
    }

    setIsRunning(false);
  };

  // Reset pipeline execution state
  const handleResetPipeline = () => {
    setTraces([]);
    setTotalTokens(0);
    setTotalDurationMs(0);
    setObjectiveResults({});
    setAllObjectivesMet(false);
    setCurrentDebugStepIndex(0);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'idle',
        executionResult: undefined,
      }))
    );
  };

  // Add a new node
  const handleAddNode = () => {
    const newNodeId = `node_step_${Date.now()}`;
    const newNode: AutomationNode = {
      id: newNodeId,
      type: 'ai_generator',
      title: 'Custom AI Analysis Step',
      description: 'Generates specialized insight or summary',
      config: {
        systemPrompt: 'You are an intelligent workflow automation agent.',
        userPromptTemplate: 'Input: {{trigger.payload}}',
        model: 'gemini-2.5-flash',
        temperature: 0.2,
        outputFormat: 'json',
      },
      position: { x: 100, y: 100 },
      nextNodes: [],
      status: 'idle',
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNodeId);
  };

  const handleUpdateNode = (updated: AutomationNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      mission: activeMission.title,
      exportedAt: new Date().toISOString(),
      nodes,
      sampleTrigger: triggerPayload,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autotrain-${activeMission.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // URL query restoration: ?workflow=... or ?config=... or ?autostart=1
  useEffect(() => {
    // 1. Check for shared workflow payload encoded in query parameters
    const sharedPayload = getSharedWorkflowFromUrl();
    if (sharedPayload && Array.isArray(sharedPayload.nodes) && sharedPayload.nodes.length > 0) {
      if (sharedPayload.missionId) {
        const foundMission = TRAINING_MISSIONS.find((m) => m.id === sharedPayload.missionId);
        if (foundMission) {
          setSelectedMissionId(foundMission.id);
        }
      }

      setNodes(sharedPayload.nodes);

      if (Array.isArray(sharedPayload.scenarios) && sharedPayload.scenarios.length > 0) {
        const mId = sharedPayload.missionId || selectedMissionId;
        setCustomScenariosMap((prev) => ({
          ...prev,
          [mId]: sharedPayload.scenarios,
        }));

        const selectedSc =
          sharedPayload.scenarios.find((s) => s.id === sharedPayload.activeScenarioId) ||
          sharedPayload.scenarios[0];
        setActiveScenario(selectedSc);
        setTriggerPayload(selectedSc.payload);
      }

      setSharedBanner({
        message: `Workflow loaded from shared link (${sharedPayload.nodes.length} nodes, ${sharedPayload.scenarios?.length || 0} scenarios)`,
        nodeCount: sharedPayload.nodes.length,
        scenarioCount: sharedPayload.scenarios?.length || 0,
      });
    }

    // 2. Autostart URL support (?autostart=1)
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setTimeout(() => {
        handleRunPipeline();
      }, 500);
    }
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const globalVariables = extractGlobalContextVariables(nodes, triggerPayload);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Universal Top Bar */}
      <TopNav
        activeView={activeView}
        setActiveView={setActiveView}
        onRunPipeline={handleRunPipeline}
        onResetPipeline={handleResetPipeline}
        onShareWorkflow={() => setIsShareModalOpen(true)}
        isRunning={isRunning}
        totalTokens={totalTokens}
        totalDurationMs={totalDurationMs}
      />

      {activeView === 'guide' ? (
        <PatternGuideModal onClose={() => setActiveView('canvas')} />
      ) : activeView === 'python_bots' ? (
        <PythonBotsStudio />
      ) : (
        <>
          {/* Shared Pipeline Loaded Banner */}
          {sharedBanner && (
            <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border-b border-indigo-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-200 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                  <Link2 className="w-3.5 h-3.5" />
                </span>
                <span>
                  <strong className="text-white">Shared Pipeline Loaded:</strong> Restored {sharedBanner.nodeCount} nodes and{' '}
                  {sharedBanner.scenarioCount} custom scenarios from URL link.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const mission =
                      TRAINING_MISSIONS.find((m) => m.id === selectedMissionId) || TRAINING_MISSIONS[0];
                    setNodes(JSON.parse(JSON.stringify(mission.initialNodes)));
                    setSharedBanner(null);
                  }}
                  className="text-xs text-indigo-300 hover:text-white font-medium underline underline-offset-2 transition-colors"
                >
                  Reset to Mission Defaults
                </button>
                <button
                  onClick={() => setSharedBanner(null)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Mission Selector Horizontal Bar */}
          <MissionSelector
            missions={TRAINING_MISSIONS}
            selectedMissionId={selectedMissionId}
            onSelectMission={handleSelectMission}
            completedMissionIds={completedMissionIds}
          />

          {/* Mission Briefing and Objectives */}
          <MissionBriefing
            mission={currentMissionWithScenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            objectiveResults={objectiveResults}
            allObjectivesMet={allObjectivesMet}
            onPayloadChange={(p) => setTriggerPayload(p)}
            onOpenWizard={() => setIsWizardOpen(true)}
          />

          {/* Main Workspace Split: Workflow Canvas + Live Execution Inspector */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
            <WorkflowCanvas
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
              onAddNode={handleAddNode}
              isRunning={isRunning}
              onRunPipeline={handleRunPipeline}
              onStepDebug={handleStepDebug}
              onExportJson={handleExportJson}
              onOpenWizard={() => setIsWizardOpen(true)}
              onShareWorkflow={() => setIsShareModalOpen(true)}
            />

            <ExecutionInspector
              traces={traces}
              isRunning={isRunning}
              totalTokens={totalTokens}
              totalDurationMs={totalDurationMs}
              runHistory={runHistory}
              onClearHistory={() => setRunHistory([])}
              globalVariables={globalVariables}
            />
          </div>

          {/* Node Configuration & Prompt Sandbox Drawer */}
          {selectedNodeId && (
            <NodeInspectorDrawer
              node={selectedNode}
              allNodes={nodes}
              onClose={() => setSelectedNodeId(null)}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              globalContext={{ trigger: { payload: triggerPayload } }}
              globalVariables={globalVariables}
            />
          )}

          {/* Test Case Wizard Modal */}
          <TestCaseWizardModal
            mission={currentMissionWithScenarios}
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onApplyScenario={handleApplyScenario}
            onSaveScenario={handleSaveScenario}
          />

          {/* Share Workflow Modal */}
          <ShareWorkflowModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            missionId={activeMission.id}
            missionTitle={activeMission.title}
            nodes={nodes}
            scenarios={allScenariosForMission}
            activeScenarioId={activeScenario.id}
          />
        </>
      )}
    </div>
  );
}
