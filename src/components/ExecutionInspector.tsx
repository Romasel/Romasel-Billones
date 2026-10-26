/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StepTrace, PipelineRunHistoryItem, ContextVariableItem } from '../types/pipeline';
import { GlobalContextView } from './GlobalContextView';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Terminal,
  TrendingUp,
  Database,
  AlertTriangle,
  Zap,
  Gauge,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface ExecutionInspectorProps {
  traces: StepTrace[];
  isRunning: boolean;
  totalTokens: number;
  totalDurationMs: number;
  runHistory: PipelineRunHistoryItem[];
  onClearHistory?: () => void;
  globalVariables?: ContextVariableItem[];
  onInsertVariable?: (templateTag: string) => void;
}

export const ExecutionInspector: React.FC<ExecutionInspectorProps> = ({
  traces,
  isRunning,
  totalTokens,
  totalDurationMs,
  runHistory,
  onClearHistory,
  globalVariables,
  onInsertVariable,
}) => {
  const [activeView, setActiveView] = useState<'steps' | 'trends' | 'context'>('steps');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [expandedStep, setExpandedStep] = useState<number | null>(
    traces.length > 0 ? traces[traces.length - 1].stepNumber : null
  );
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');
  const [copied, setCopied] = useState(false);
  const [metricFilter, setMetricFilter] = useState<'both' | 'latency' | 'tokens'>('both');

  // Auto-expand last step when traces update
  React.useEffect(() => {
    if (traces.length > 0) {
      setExpandedStep(traces[traces.length - 1].stepNumber);
    }
  }, [traces.length]);

  const safeJsonStringify = (data: any, indent = 2): string => {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);
    try {
      const seen = new WeakSet();
      return JSON.stringify(
        data,
        (_key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
              return '[HTML Element]';
            }
            if (value.$$typeof) {
              return '[React Element]';
            }
            seen.add(value);
          }
          return value;
        },
        indent
      );
    } catch {
      return String(data);
    }
  };

  const handleCopy = (data: any) => {
    navigator.clipboard.writeText(safeJsonStringify(data, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Slice down specifically to the last 10 pipeline execution runs for the latency line chart
  const last10Runs = runHistory.slice(-10);

  // Line chart data plotting latencyMs across the last 10 runs
  const lineChartData = last10Runs.map((item) => {
    const lat = item.latencyMs ?? item.durationMs;
    return {
      name: `Run #${item.runNumber}`,
      runNumber: item.runNumber,
      latencyMs: lat,
      tokensUsed: item.tokensUsed,
      missionTitle: item.missionTitle,
      status: item.status,
      timestamp: item.timestamp,
      slowestNode: item.slowestNode?.title || 'Processing Phase',
      slowestLatency: item.slowestNode?.latencyMs || 0,
      slowestPercentage: item.slowestNode?.percentage || 0,
    };
  });

  // Calculate stats over the last 10 runs
  const totalIn10 = last10Runs.length;
  const avgLatency10 =
    totalIn10 > 0
      ? Math.round(last10Runs.reduce((acc, h) => acc + (h.latencyMs ?? h.durationMs), 0) / totalIn10)
      : 0;
  const maxLatency10 =
    totalIn10 > 0
      ? Math.max(...last10Runs.map((h) => h.latencyMs ?? h.durationMs))
      : 0;
  const minLatency10 =
    totalIn10 > 0
      ? Math.min(...last10Runs.map((h) => h.latencyMs ?? h.durationMs))
      : 0;

  // Identify the performance bottleneck run in the last 10 runs
  const bottleneckRun = [...last10Runs].sort(
    (a, b) => (b.latencyMs ?? b.durationMs) - (a.latencyMs ?? a.durationMs)
  )[0];

  const CustomLatencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBottleneck = data.latencyMs === maxLatency10 && maxLatency10 > 0;

      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-mono max-w-[240px]">
          <div className="font-bold text-white flex items-center justify-between gap-3">
            <span>{data.name}</span>
            <span className="text-slate-400 font-normal text-[11px]">{data.timestamp}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans truncate">{data.missionTitle}</div>

          <div className="pt-1.5 border-t border-slate-900 space-y-1">
            <div className="text-indigo-300 flex items-center justify-between gap-4">
              <span>Latency:</span>
              <span className="font-bold text-sm text-indigo-400">{data.latencyMs}ms</span>
            </div>
            <div className="text-emerald-300 flex items-center justify-between gap-4">
              <span>Tokens:</span>
              <span className="font-medium">{data.tokensUsed} tok</span>
            </div>

            {data.slowestLatency > 0 && (
              <div className="mt-1 pt-1 border-t border-slate-900 text-[10px] text-amber-300/90 font-sans">
                <span className="font-semibold block">Bottleneck Step:</span>
                <span className="text-slate-300">{data.slowestNode}</span> ({data.slowestLatency}ms)
              </div>
            )}

            {isBottleneck && (
              <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[10px] flex items-center gap-1 font-sans">
                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Peak Latency Bottleneck</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full lg:w-[480px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 h-96 lg:h-auto overflow-hidden">
      {/* Header & View Switcher */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveView('steps')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeView === 'steps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Steps</span>
          </button>

          <button
            onClick={() => setActiveView('trends')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeView === 'trends'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trends</span>
          </button>

          <button
            onClick={() => setActiveView('context')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              activeView === 'context'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Global Context</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-950/80 rounded text-slate-300">
              {globalVariables?.length || 0}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 tabular-nums">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{totalDurationMs}ms</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            <span>{totalTokens} tok</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Live Step-by-Step Traces */}
      {activeView === 'steps' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {traces.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Activity className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
              <div className="text-xs font-medium text-slate-400">Ready to Execute</div>
              <div className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Click &quot;Run Automation&quot; in the top bar to trigger the pipeline and observe live step telemetry.
              </div>
            </div>
          ) : (
            traces.map((trace) => {
              const isExpanded = expandedStep === trace.stepNumber;
              const isSuccess = trace.status === 'success';

              return (
                <div
                  key={trace.stepNumber}
                  className="bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden text-xs"
                >
                  {/* Step Row Header */}
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : trace.stepNumber)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 w-4">
                        {trace.stepNumber}.
                      </span>
                      {isSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200 truncate max-w-[190px]">
                        {trace.nodeTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {trace.latencyMs}ms
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-slate-900 bg-slate-950">
                      <div className="flex items-center justify-between py-2">
                        {/* Tabs: Output vs Input */}
                        <div className="flex gap-1 bg-slate-900 p-0.5 rounded">
                          <button
                            onClick={() => setActiveTab('output')}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                              activeTab === 'output'
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Step Output
                          </button>
                          <button
                            onClick={() => setActiveTab('input')}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                              activeTab === 'input'
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Step Input
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            handleCopy(activeTab === 'output' ? trace.output : trace.input)
                          }
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Code Display */}
                      <pre className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                        {safeJsonStringify(
                          activeTab === 'output' ? trace.output : trace.input,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : activeView === 'trends' ? (
        /* VIEW 2: Historical Latency Line Chart & Bottleneck Inspector (Recharts) */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary KPI Strip for the last 10 runs */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                Avg Latency
              </span>
              <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">
                {avgLatency10}ms
              </span>
              <span className="text-[10px] text-slate-500 block">last 10 runs</span>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-rose-400 uppercase font-semibold block truncate">
                Max Latency
              </span>
              <span className="text-sm font-bold font-mono text-rose-300 tabular-nums">
                {maxLatency10}ms
              </span>
              <span className="text-[10px] text-rose-400/70 block">bottleneck</span>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block truncate">
                Best Latency
              </span>
              <span className="text-sm font-bold font-mono text-emerald-300 tabular-nums">
                {minLatency10}ms
              </span>
              <span className="text-[10px] text-emerald-400/70 block">fastest</span>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                History
              </span>
              <span className="text-sm font-bold font-mono text-white tabular-nums">
                {last10Runs.length} Runs
              </span>
              <span className="text-[10px] text-slate-500 block">max 10 plotted</span>
            </div>
          </div>

          {/* Performance Bottleneck Analysis Card */}
          {bottleneckRun && (
            <div className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Performance Bottleneck Diagnostics</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Run #{bottleneckRun.runNumber} Peak ({bottleneckRun.latencyMs ?? bottleneckRun.durationMs}ms)
                </span>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {bottleneckRun.slowestNode ? (
                  <span>
                    Primary bottleneck observed in{' '}
                    <strong className="text-indigo-300 font-semibold">
                      {bottleneckRun.slowestNode.title}
                    </strong>{' '}
                    consuming{' '}
                    <span className="font-mono text-amber-300">
                      {bottleneckRun.slowestNode.latencyMs}ms
                    </span>{' '}
                    ({bottleneckRun.slowestNode.percentage}% of cycle time).
                  </span>
                ) : (
                  <span>
                    Latency variance is within normal LLM inference parameters. AI generation
                    and network steps account for the majority of execution overhead.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>
                  Tip: Use prompt pruning, lower temperature, or structured schemas to reduce latency.
                </span>
              </div>
            </div>
          )}

          {/* Metric & Chart Switcher */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Latency Over Last 10 Runs:
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  chartType === 'line'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Line chart plotting latencyMs over last 10 runs"
              >
                <LineChartIcon className="w-3 h-3" />
                <span>Line (Latency)</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  chartType === 'area'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Multi-metric Area chart"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Multi-Metric</span>
              </button>
            </div>
          </div>

          {/* RECHARTS CHART: LineChart for latencyMs over last 10 runs (or AreaChart) */}
          <div className="h-56 w-full bg-slate-950/90 rounded-xl border border-slate-800 p-2.5 pt-3 relative">
            {chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 12, right: 12, left: -15, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    stroke="#334155"
                  />
                  <YAxis
                    dataKey="latencyMs"
                    unit="ms"
                    tick={{ fontSize: 10, fill: '#818cf8' }}
                    stroke="#4338ca"
                  />
                  <Tooltip content={<CustomLatencyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                    iconType="circle"
                  />

                  {avgLatency10 > 0 && (
                    <ReferenceLine
                      y={avgLatency10}
                      stroke="#6366f1"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Avg ${avgLatency10}ms`,
                        fill: '#a5b4fc',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="latencyMs"
                    name="Latency (ms)"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5', stroke: '#c7d2fe', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#a5b4fc', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={lineChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    stroke="#334155"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: '#818cf8' }}
                    stroke="#4338ca"
                    unit="ms"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#34d399' }}
                    stroke="#059669"
                    unit="t"
                  />
                  <Tooltip content={<CustomLatencyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                    iconType="circle"
                  />

                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="latencyMs"
                    name="Latency (ms)"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#latencyGradient)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="tokensUsed"
                    name="Tokens"
                    stroke="#34d399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tokensGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Historical Runs Log Stream Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="text-[11px] uppercase tracking-wider">Last 10 Runs Telemetry</span>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-950 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-1.5 px-2.5">RUN</th>
                    <th className="py-1.5 px-2.5">LATENCY</th>
                    <th className="py-1.5 px-2.5">BOTTLENECK PHASE</th>
                    <th className="py-1.5 px-2.5">TOKENS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {last10Runs.map((item) => {
                    const lat = item.latencyMs ?? item.durationMs;
                    const isPeak = lat === maxLatency10 && maxLatency10 > 0;
                    return (
                      <tr key={item.runId} className="hover:bg-slate-900/50">
                        <td className="py-1.5 px-2.5 text-slate-300 font-semibold">
                          #{item.runNumber}
                        </td>
                        <td className="py-1.5 px-2.5 font-bold tabular-nums">
                          <span
                            className={
                              isPeak ? 'text-rose-400' : 'text-indigo-300'
                            }
                          >
                            {lat}ms
                          </span>
                          {isPeak && (
                            <span className="ml-1.5 px-1 py-0.2 text-[9px] rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                              Peak
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-400 truncate max-w-[140px] font-sans">
                          {item.slowestNode?.title || 'Execution'}
                        </td>
                        <td className="py-1.5 px-2.5 text-emerald-300 tabular-nums">
                          {item.tokensUsed} tok
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 3: Global Context Variables & Demo Explanations */
        <GlobalContextView
          variables={globalVariables || []}
          onInsertVariable={onInsertVariable}
        />
      )}
    </div>
  );
};
