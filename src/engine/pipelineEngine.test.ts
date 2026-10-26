/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNestedValue,
  interpolateVariables,
  evaluateCondition,
  runPipeline,
  evaluateObjectives,
} from './pipelineEngine';
import { AutomationNode, MissionObjective } from '../types/pipeline';

test('getNestedValue correctly retrieves shallow and deep properties', () => {
  const context = {
    trigger: {
      payload: {
        sender: 'alice@example.com',
        nested: { count: 42 },
      },
    },
  };

  assert.equal(getNestedValue(context, 'trigger.payload.sender'), 'alice@example.com');
  assert.equal(getNestedValue(context, 'trigger.payload.nested.count'), 42);
  assert.equal(getNestedValue(context, 'trigger.payload.missing'), undefined);
});

test('interpolateVariables replaces {{variable.path}} patterns', () => {
  const context = {
    trigger: {
      payload: {
        senderName: 'Sarah Connor',
        orderId: 'ORD-9921',
      },
    },
    ai_classifier: {
      output: {
        sentiment: 'negative',
      },
    },
  };

  const template = 'Customer {{trigger.payload.senderName}} filed order {{trigger.payload.orderId}} with sentiment {{ai_classifier.output.sentiment}}.';
  const result = interpolateVariables(template, context);

  assert.equal(
    result,
    'Customer Sarah Connor filed order ORD-9921 with sentiment negative.'
  );
});

test('evaluateCondition supports string, numeric, and containment operators', () => {
  assert.equal(evaluateCondition('billing_refund', 'equals', 'billing_refund'), true);
  assert.equal(evaluateCondition('billing_refund', 'equals', 'technical_bug'), false);
  assert.equal(evaluateCondition('Urgent refund required', 'contains', 'refund'), true);
  assert.equal(evaluateCondition(1500, 'greater_than', 1000), true);
  assert.equal(evaluateCondition(500, 'less_than', 1000), true);
  assert.equal(evaluateCondition('refund', 'in', 'refund, billing, chargeback'), true);
});

test('runPipeline runs a 3-step automated workflow end-to-end', async () => {
  const nodes: AutomationNode[] = [
    {
      id: 'node_trigger',
      type: 'trigger',
      title: 'Incoming Customer Email',
      description: 'Triggered when a support email arrives',
      config: {
        triggerType: 'email',
        sourceName: 'Support Inbox',
        samplePayload: {
          senderName: 'David Miller',
          senderEmail: 'david@corp.io',
          subject: 'Need an immediate refund for invoice #889',
          body: 'I was double charged! Please issue a refund immediately.',
        },
      },
      position: { x: 50, y: 150 },
      nextNodes: ['node_classifier'],
      status: 'idle',
    },
    {
      id: 'node_classifier',
      type: 'ai_classifier',
      title: 'Intent & Sentiment AI',
      description: 'Classifies incoming request',
      config: {
        systemPrompt: 'You are an email triage classifier.',
        userPromptTemplate: 'Analyze: {{trigger.payload.subject}} - {{trigger.payload.body}}',
        model: 'gemini-2.5-flash',
        temperature: 0.1,
        outputFormat: 'json',
      },
      position: { x: 300, y: 150 },
      nextNodes: ['node_condition'],
      status: 'idle',
    },
    {
      id: 'node_condition',
      type: 'condition',
      title: 'Is Billing Refund?',
      description: 'Branch if refund category',
      config: {
        variablePath: 'node_classifier.output.category',
        operator: 'equals',
        targetValue: 'billing_refund',
        trueNextNodeId: 'node_responder',
        falseNextNodeId: undefined,
      },
      position: { x: 550, y: 150 },
      nextNodes: [],
      status: 'idle',
    },
    {
      id: 'node_responder',
      type: 'ai_generator',
      title: 'Empathetic Auto-Responder',
      description: 'Drafts response email',
      config: {
        systemPrompt: 'Draft empathetic support reply.',
        userPromptTemplate: 'Draft response to: {{trigger.payload.body}}',
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        outputFormat: 'json',
      },
      position: { x: 800, y: 100 },
      nextNodes: [],
      status: 'idle',
    },
  ];

  const payload = {
    senderName: 'David Miller',
    senderEmail: 'david@corp.io',
    subject: 'Refund please',
    body: 'I was double charged and need a refund',
  };

  const runResult = await runPipeline(nodes, payload);

  assert.equal(runResult.success, true);
  assert.equal(runResult.traces.length, 4);
  assert.equal(runResult.nodeResults['node_classifier'].status, 'success');
  assert.equal(runResult.nodeResults['node_classifier'].output.category, 'billing_refund');
  assert.equal(runResult.nodeResults['node_condition'].output.conditionMatched, true);
  assert.equal(runResult.nodeResults['node_responder'].status, 'success');
});

test('evaluateObjectives evaluates training objectives', () => {
  const objectives: MissionObjective[] = [
    {
      id: 'obj_1',
      title: 'Classify intent',
      description: 'Successfully classify intent',
      testFunctionId: 'has_classified_intent',
    },
    {
      id: 'obj_2',
      title: 'Branch to refund',
      description: 'Branch on refund',
      testFunctionId: 'handled_refund_routing',
    },
  ];

  const fakeNodeResults = {
    classifier: {
      status: 'success' as const,
      output: { category: 'billing_refund' },
      input: {},
      latencyMs: 100,
      tokensUsed: 100,
      timestamp: '12:00:00',
    },
    condition: {
      status: 'success' as const,
      output: { branchSelected: 'TRUE branch' },
      input: {},
      latencyMs: 20,
      tokensUsed: 0,
      timestamp: '12:00:01',
    },
  };

  const { objectiveResults, allPassed } = evaluateObjectives(
    objectives,
    fakeNodeResults,
    {}
  );

  assert.equal(objectiveResults['obj_1'], true);
  assert.equal(objectiveResults['obj_2'], true);
  assert.equal(allPassed, true);
});
