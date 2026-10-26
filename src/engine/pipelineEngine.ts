/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AutomationNode,
  NodeExecutionResult,
  PipelineRunResult,
  StepTrace,
  MissionObjective,
} from '../types/pipeline';

/**
 * Safely extracts a nested property using dot-path notation.
 * e.g. "trigger.payload.customer.name" or "classifier.output.sentiment"
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.trim().replace(/^\{\{|\}\}$/g, '').split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Replaces {{variable.path}} patterns inside a string template with values from context.
 */
export function interpolateVariables(template: string, context: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, path) => {
    const val = getNestedValue(context, path);
    if (val === undefined || val === null) {
      return '';
    }
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }
    return String(val);
  });
}

/**
 * Evaluates a conditional rule between an evaluated left value, operator, and target.
 */
export function evaluateCondition(left: any, operator: string, right: any): boolean {
  const normLeft = left !== undefined && left !== null ? left : '';
  const normRight = right !== undefined && right !== null ? right : '';

  switch (operator) {
    case 'equals':
      return String(normLeft).toLowerCase().trim() === String(normRight).toLowerCase().trim();
    case 'not_equals':
      return String(normLeft).toLowerCase().trim() !== String(normRight).toLowerCase().trim();
    case 'contains':
      return String(normLeft).toLowerCase().includes(String(normRight).toLowerCase());
    case 'greater_than':
      return Number(normLeft) > Number(normRight);
    case 'less_than':
      return Number(normLeft) < Number(normRight);
    case 'in': {
      const items = String(normRight).split(',').map((s) => s.trim().toLowerCase());
      return items.includes(String(normLeft).toLowerCase().trim());
    }
    default:
      return false;
  }
}

/**
 * Executes a simulated AI extraction or classification based on prompt guidelines.
 */
export function processAiSimulation(
  type: string,
  resolvedUserPrompt: string,
  systemPrompt: string,
  context: Record<string, any>,
  outputFormat: 'json' | 'text' = 'json'
): { output: any; tokens: number; latencyMs: number } {
  const textPrompt = resolvedUserPrompt.toLowerCase();

  // 1. AI Classifier logic
  if (type === 'ai_classifier') {
    let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent_negative' = 'neutral';
    let category = 'general_inquiry';
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let confidence = 0.94;

    if (textPrompt.includes('refund') || textPrompt.includes('money back') || textPrompt.includes('cancel') || textPrompt.includes('charge')) {
      category = 'billing_refund';
      sentiment = 'negative';
      urgency = 'high';
    } else if (textPrompt.includes('bug') || textPrompt.includes('error') || textPrompt.includes('crash') || textPrompt.includes('not working') || textPrompt.includes('broken')) {
      category = 'technical_bug';
      sentiment = 'negative';
      urgency = 'high';
    } else if (textPrompt.includes('love') || textPrompt.includes('great') || textPrompt.includes('thank') || textPrompt.includes('awesome')) {
      category = 'compliment_feedback';
      sentiment = 'positive';
      urgency = 'low';
      confidence = 0.98;
    } else if (textPrompt.includes('lawyer') || textPrompt.includes('sue') || textPrompt.includes('urgent') || textPrompt.includes('immediately')) {
      category = 'urgent_escalation';
      sentiment = 'urgent_negative';
      urgency = 'critical';
      confidence = 0.96;
    }

    const output = outputFormat === 'json' ? {
      category,
      sentiment,
      urgency,
      confidence,
      reasoning: `Detected key customer intent markers matching ${category} with ${urgency} priority requirement.`,
      detectedKeywords: textPrompt.match(/(refund|cancel|bug|crash|error|broken|love|thanks|urgent|sue)/g) || ['standard inquiry'],
    } : `Category: ${category}\nSentiment: ${sentiment}\nUrgency: ${urgency}\nConfidence: ${confidence}`;

    return {
      output,
      tokens: 185,
      latencyMs: 320,
    };
  }

  // 2. AI Document/Invoice Extractor logic
  if (type === 'ai_extractor') {
    // Try to extract invoice or lead data
    const invoiceNumMatch = resolvedUserPrompt.match(/INV-[\d-]+|invoice\s*#?\s*([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceNumMatch ? invoiceNumMatch[0] : 'INV-2026-9042';

    const vendorMatch = resolvedUserPrompt.match(/from:\s*([^\n,]+)|vendor:\s*([^\n,]+)|bill to:\s*([^\n,]+)/i);
    const vendor = vendorMatch ? (vendorMatch[1] || vendorMatch[2] || vendorMatch[3] || 'CloudScale Systems Inc.').trim() : 'CloudScale Systems Inc.';

    const totalMatch = resolvedUserPrompt.match(/\$([\d,]+(?:\.\d{2})?)/);
    const totalAmount = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 1450.0;

    const subtotal = Math.round(totalAmount * 0.9 * 100) / 100;
    const tax = Math.round((totalAmount - subtotal) * 100) / 100;

    const output = outputFormat === 'json' ? {
      invoiceNumber,
      vendor,
      date: '2026-10-24',
      dueDate: '2026-11-24',
      lineItems: [
        { description: 'Cloud Compute Infrastructure - Dedicated GPU Clusters', quantity: 2, unitPrice: subtotal / 2, total: subtotal }
      ],
      subtotal,
      taxAmount: tax,
      totalAmount,
      currency: 'USD',
      mathVerificationPassed: Math.abs((subtotal + tax) - totalAmount) < 0.05,
      isCompliant: totalAmount < 5000,
    } : `Invoice: ${invoiceNumber}\nVendor: ${vendor}\nTotal: $${totalAmount}`;

    return {
      output,
      tokens: 310,
      latencyMs: 440,
    };
  }

  // 3. AI Lead Qualifier or Research/Generator
  const customerName = context.trigger?.payload?.senderName || context.trigger?.payload?.name || 'Valued Customer';
  const issue = context.ai_classifier?.output?.category || 'your recent request';

  let responseBody = '';
  if (type === 'ai_generator') {
    if (textPrompt.includes('refund') || textPrompt.includes('billing')) {
      responseBody = `Dear ${customerName},\n\nThank you for reaching out regarding your account. We understand your concern and apologize for the inconvenience. Our billing specialist team has verified your order and initiated a full credit review. You will receive an updated receipt within 1-2 business days.\n\nWarm regards,\nSupport Operations Team`;
    } else if (textPrompt.includes('bug') || textPrompt.includes('technical')) {
      responseBody = `Dear ${customerName},\n\nThank you for alerting us to this technical issue. Our engineering team has received the diagnostic trace and opened ticket #ENG-8821. We are actively investigating the root cause and will update you as soon as a hotfix is deployed.\n\nBest regards,\nDeveloper Reliability Team`;
    } else {
      responseBody = `Dear ${customerName},\n\nThank you for contacting us. We have received your inquiry regarding ${issue} and our team is actively reviewing your message. We strive to provide the best possible experience and will follow up shortly.\n\nWarm regards,\nCustomer Care Team`;
    }

    const output = outputFormat === 'json' ? {
      subject: `Update regarding your inquiry [${context.ai_classifier?.output?.category || 'General'}]`,
      recipient: context.trigger?.payload?.senderEmail || 'customer@example.com',
      messageBody: responseBody,
      tone: 'Empathetic & Professional',
      wordCount: responseBody.split(/\s+/).length,
      requiresHumanSignoff: context.ai_classifier?.output?.urgency === 'critical',
    } : responseBody;

    return {
      output,
      tokens: 245,
      latencyMs: 380,
    };
  }

  // Default fallback
  return {
    output: {
      status: 'processed',
      summary: `Automated analysis completed for: ${resolvedUserPrompt.slice(0, 80)}...`,
      resolvedAt: new Date().toISOString(),
    },
    tokens: 150,
    latencyMs: 290,
  };
}

/**
 * Executes a single automation node given the current execution context.
 */
export async function executeNode(
  node: AutomationNode,
  context: Record<string, any>
): Promise<NodeExecutionResult> {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  try {
    switch (node.type) {
      case 'trigger': {
        const payload = context.trigger?.payload || (node.config as any)?.samplePayload || {};
        return {
          input: { triggerType: (node.config as any)?.triggerType || 'webhook' },
          output: payload,
          latencyMs: 25,
          tokensUsed: 0,
          status: 'success',
          timestamp,
        };
      }

      case 'ai_classifier':
      case 'ai_extractor':
      case 'ai_generator': {
        const config = node.config as any;
        const resolvedPrompt = interpolateVariables(config.userPromptTemplate || '', context);
        const resolvedSystem = interpolateVariables(config.systemPrompt || '', context);

        const simResult = processAiSimulation(
          node.type,
          resolvedPrompt,
          resolvedSystem,
          context,
          config.outputFormat || 'json'
        );

        return {
          input: {
            resolvedPrompt,
            model: config.model || 'gemini-2.5-flash',
            temperature: config.temperature ?? 0.2,
          },
          output: simResult.output,
          latencyMs: simResult.latencyMs + Math.floor(Math.random() * 40),
          tokensUsed: simResult.tokens,
          status: 'success',
          timestamp,
        };
      }

      case 'condition': {
        const config = node.config as any;
        const rawLeft = getNestedValue(context, config.variablePath);
        const passed = evaluateCondition(rawLeft, config.operator, config.targetValue);

        return {
          input: {
            variablePath: config.variablePath,
            evaluatedValue: rawLeft,
            operator: config.operator,
            targetValue: config.targetValue,
          },
          output: {
            conditionMatched: passed,
            branchSelected: passed ? 'TRUE branch' : 'FALSE branch',
            nextTargetNodeId: passed ? config.trueNextNodeId : config.falseNextNodeId,
          },
          latencyMs: 15,
          tokensUsed: 0,
          status: 'success',
          timestamp,
        };
      }

      case 'action_email':
      case 'action_webhook':
      case 'action_database': {
        const config = node.config as any;
        const resolvedDestination = interpolateVariables(config.destination || '', context);
        const resolvedPayload: Record<string, any> = {};

        if (config.payloadTemplate) {
          for (const [k, v] of Object.entries(config.payloadTemplate)) {
            resolvedPayload[k] = interpolateVariables(String(v), context);
          }
        }

        return {
          input: {
            destination: resolvedDestination,
            actionType: config.actionType || node.type,
            payload: resolvedPayload,
          },
          output: {
            dispatched: true,
            status: 200,
            confirmationId: `DISP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            deliveredAt: new Date().toISOString(),
            destination: resolvedDestination,
          },
          latencyMs: 85,
          tokensUsed: 0,
          status: 'success',
          timestamp,
        };
      }

      default:
        return {
          input: {},
          output: { note: 'Generic node executed' },
          latencyMs: 10,
          tokensUsed: 0,
          status: 'success',
          timestamp,
        };
    }
  } catch (err: any) {
    return {
      input: {},
      output: null,
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
      status: 'error',
      errorMessage: err?.message || 'Unknown node execution error',
      timestamp,
    };
  }
}

/**
 * Runs the full automated workflow pipeline graph.
 */
export async function runPipeline(
  nodes: AutomationNode[],
  triggerPayload: Record<string, any>,
  onStepProgress?: (trace: StepTrace) => void
): Promise<PipelineRunResult> {
  const nodeMap = new Map<string, AutomationNode>(nodes.map((n) => [n.id, n]));
  const nodeResults: Record<string, NodeExecutionResult> = {};
  const traces: StepTrace[] = [];

  // Find root node (trigger)
  const triggerNode = nodes.find((n) => n.type === 'trigger') || nodes[0];
  if (!triggerNode) {
    return {
      success: false,
      totalDurationMs: 0,
      totalTokens: 0,
      nodeResults: {},
      traces: [],
      objectiveResults: {},
      allObjectivesMet: false,
    };
  }

  // Global context accessible to all downstream nodes
  const context: Record<string, any> = {
    trigger: { payload: triggerPayload },
  };

  const queue: string[] = [triggerNode.id];
  const visited = new Set<string>();
  let stepCounter = 1;
  let totalTokens = 0;
  let totalDurationMs = 0;

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    if (visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);

    const node = nodeMap.get(currentNodeId);
    if (!node) continue;

    // Execute node
    const result = await executeNode(node, context);
    nodeResults[node.id] = result;
    totalTokens += result.tokensUsed;
    totalDurationMs += result.latencyMs;

    // Store in context by node id
    context[node.id] = {
      input: result.input,
      output: result.output,
    };

    const trace: StepTrace = {
      stepNumber: stepCounter++,
      nodeId: node.id,
      nodeTitle: node.title,
      nodeType: node.type,
      status: result.status,
      input: result.input,
      output: result.output,
      latencyMs: result.latencyMs,
      tokensUsed: result.tokensUsed,
      logMessage: `Executed node "${node.title}" with status: ${result.status}`,
      timestamp: result.timestamp,
    };

    traces.push(trace);
    if (onStepProgress) {
      onStepProgress(trace);
    }

    if (result.status === 'error') {
      break;
    }

    // Determine next nodes
    if (node.type === 'condition') {
      const condResult = result.output;
      const nextId = condResult.nextTargetNodeId;
      if (nextId && nodeMap.has(nextId)) {
        queue.push(nextId);
      }
    } else {
      for (const nextId of node.nextNodes || []) {
        if (!visited.has(nextId)) {
          queue.push(nextId);
        }
      }
    }
  }

  return {
    success: traces.every((t) => t.status !== 'error'),
    totalDurationMs,
    totalTokens,
    nodeResults,
    traces,
    objectiveResults: {},
    allObjectivesMet: false,
  };
}

/**
 * Checks whether mission objectives are met based on execution results.
 */
export function evaluateObjectives(
  objectives: MissionObjective[],
  nodeResults: Record<string, NodeExecutionResult>,
  context: Record<string, any>
): { objectiveResults: Record<string, boolean>; allPassed: boolean } {
  const objectiveResults: Record<string, boolean> = {};

  for (const obj of objectives) {
    let passed = false;

    switch (obj.testFunctionId) {
      case 'has_classified_intent': {
        const classifierNode = Object.values(nodeResults).find(
          (r) => r.output && r.output.category
        );
        passed = Boolean(classifierNode && classifierNode.status === 'success');
        break;
      }
      case 'handled_refund_routing': {
        const condNode = Object.values(nodeResults).find(
          (r) => r.output && r.output.branchSelected
        );
        passed = Boolean(condNode && condNode.status === 'success');
        break;
      }
      case 'generated_personalized_response': {
        const genNode = Object.values(nodeResults).find(
          (r) => r.output && (r.output.messageBody || r.output.subject)
        );
        passed = Boolean(genNode && genNode.status === 'success');
        break;
      }
      case 'math_verification_checked': {
        const extractorNode = Object.values(nodeResults).find(
          (r) => r.output && r.output.mathVerificationPassed !== undefined
        );
        passed = Boolean(extractorNode && extractorNode.output.mathVerificationPassed === true);
        break;
      }
      case 'lead_scoring_calculated': {
        const anySuccess = Object.values(nodeResults).some((r) => r.status === 'success');
        passed = anySuccess;
        break;
      }
      default:
        passed = Object.values(nodeResults).some((r) => r.status === 'success');
    }

    objectiveResults[obj.id] = passed;
  }

  const allPassed = objectives.length > 0 && Object.values(objectiveResults).every(Boolean);
  return { objectiveResults, allPassed };
}
