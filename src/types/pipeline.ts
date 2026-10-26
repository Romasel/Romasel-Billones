/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeType =
  | 'trigger'
  | 'ai_classifier'
  | 'ai_extractor'
  | 'ai_generator'
  | 'condition'
  | 'action_email'
  | 'action_webhook'
  | 'action_database';

export interface NodePosition {
  x: number;
  y: number;
}

export interface BaseNodeConfig {
  [key: string]: any;
}

export interface TriggerConfig extends BaseNodeConfig {
  triggerType: 'webhook' | 'email' | 'schedule' | 'manual';
  sourceName: string;
  samplePayload: Record<string, any>;
}

export interface AiNodeConfig extends BaseNodeConfig {
  systemPrompt: string;
  userPromptTemplate: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'simulated-llm';
  temperature: number;
  outputFormat: 'json' | 'text';
  expectedJsonSchema?: string;
  mockResponseStrategy?: string;
}

export interface ConditionConfig extends BaseNodeConfig {
  variablePath: string; // e.g. "ai_classifier.output.category" or "trigger.payload.amount"
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  targetValue: string | number;
  trueNextNodeId?: string;
  falseNextNodeId?: string;
}

export interface ActionConfig extends BaseNodeConfig {
  actionType: 'send_email' | 'webhook_post' | 'database_upsert' | 'slack_alert';
  destination: string;
  payloadTemplate: Record<string, string>;
}

export interface NodeExecutionResult {
  input: any;
  output: any;
  latencyMs: number;
  tokensUsed: number;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
  timestamp: string;
}

export interface AutomationNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  config: TriggerConfig | AiNodeConfig | ConditionConfig | ActionConfig | any;
  position: NodePosition;
  nextNodes: string[]; // Node IDs that execute after this node (for linear or default branches)
  status: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  executionResult?: NodeExecutionResult;
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  testFunctionId: string;
}

export interface TestScenario {
  id: string;
  label: string;
  description: string;
  payload: Record<string, any>;
  expectedCategory?: string;
  expectedOutcomeNotice?: string;
}

export interface TrainingMission {
  id: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Customer Ops' | 'Finance & OCR' | 'Sales & Growth' | 'Agentic Reasoning' | 'Sandbox';
  description: string;
  learningKeynotes: string[];
  initialNodes: AutomationNode[];
  testScenarios: TestScenario[];
  objectives: MissionObjective[];
}

export interface StepTrace {
  stepNumber: number;
  nodeId: string;
  nodeTitle: string;
  nodeType: NodeType;
  status: 'running' | 'success' | 'error' | 'skipped';
  input: any;
  output: any;
  latencyMs: number;
  tokensUsed: number;
  logMessage: string;
  timestamp: string;
}

export interface PipelineRunResult {
  success: boolean;
  totalDurationMs: number;
  totalTokens: number;
  nodeResults: Record<string, NodeExecutionResult>;
  traces: StepTrace[];
  objectiveResults: Record<string, boolean>;
  allObjectivesMet: boolean;
}

export interface PipelineRunHistoryItem {
  runId: string;
  runNumber: number;
  missionTitle: string;
  timestamp: string;
  durationMs: number;
  latencyMs: number;
  tokensUsed: number;
  nodeCount: number;
  status: 'success' | 'error';
  slowestNode?: {
    nodeId: string;
    title: string;
    nodeType: string;
    latencyMs: number;
    percentage: number;
  };
}

export interface ContextVariableItem {
  key: string;
  templateTag: string;
  sourceNodeId: string;
  sourceNodeTitle: string;
  sourceNodeType: string;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  currentValue: any;
  demoExplanation: string;
  promptUsageTip: string;
}
