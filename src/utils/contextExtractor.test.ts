/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGlobalContextVariables } from './contextExtractor';
import { AutomationNode } from '../types/pipeline';

test('extractGlobalContextVariables extracts trigger payload variables with demo explanations', () => {
  const triggerPayload = {
    senderName: 'Sarah Connor',
    senderEmail: 'sarah@skynet-resistance.org',
    subject: 'Emergency security audit',
    body: 'Urgent investigation requested.',
    orderId: 'ORD-1984',
  };

  const nodes: AutomationNode[] = [
    {
      id: 'node_trigger',
      type: 'trigger',
      title: 'Inbound Support Email',
      description: 'Trigger node',
      config: {},
      position: { x: 0, y: 0 },
      nextNodes: ['node_classifier'],
      status: 'idle',
    },
    {
      id: 'node_classifier',
      type: 'ai_classifier',
      title: 'Intent Classifier',
      description: 'Classifier node',
      config: {},
      position: { x: 100, y: 0 },
      nextNodes: [],
      status: 'idle',
    },
  ];

  const variables = extractGlobalContextVariables(nodes, triggerPayload);

  // Check trigger variables
  const senderVar = variables.find((v) => v.key === 'trigger.payload.senderName');
  assert.ok(senderVar, 'senderName variable must be present');
  assert.equal(senderVar.templateTag, '{{trigger.payload.senderName}}');
  assert.equal(senderVar.currentValue, 'Sarah Connor');
  assert.ok(senderVar.demoExplanation.length > 10, 'Must have clear demo explanation');
  assert.ok(senderVar.promptUsageTip.includes('Dear'), 'Must provide prompt tip');

  // Check downstream classifier output variables
  const categoryVar = variables.find((v) => v.key === 'node_classifier.output.category');
  assert.ok(categoryVar, 'classifier category variable must be present');
  assert.equal(categoryVar.templateTag, '{{node_classifier.output.category}}');
  assert.ok(categoryVar.demoExplanation.includes('classifier'));
});
