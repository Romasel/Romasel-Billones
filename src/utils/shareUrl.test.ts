/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  encodeWorkflowConfig,
  decodeWorkflowConfig,
  WorkflowSharePayload,
} from './shareUrl';

describe('Workflow Share URL encoding and decoding', () => {
  it('should encode and decode a workflow payload symmetrically', () => {
    const payload: WorkflowSharePayload = {
      v: 1,
      missionId: 'support-triage-101',
      missionTitle: 'Customer Support Triage',
      nodes: [
        {
          id: 'test-node-1',
          type: 'trigger',
          title: 'Incoming Ticket',
          description: 'Webhook listener',
          position: { x: 100, y: 150 },
          nextNodes: ['ai-classifier'],
          status: 'idle',
          config: { triggerType: 'webhook', sourceName: 'Zendesk' },
        },
      ],
      scenarios: [
        {
          id: 'sc-1',
          label: 'Billing query',
          description: 'User asking for refund',
          payload: { text: 'I want a refund for transaction #4892' },
        },
      ],
      activeScenarioId: 'sc-1',
      createdAt: 1700000000000,
    };

    const encoded = encodeWorkflowConfig(payload);
    assert.ok(typeof encoded === 'string');
    assert.ok(encoded.length > 0);
    // Should be URL-safe (no +, no /, no =)
    assert.strictEqual(encoded.includes('+'), false);
    assert.strictEqual(encoded.includes('/'), false);
    assert.strictEqual(encoded.includes('='), false);

    const decoded = decodeWorkflowConfig(encoded);
    assert.ok(decoded);
    assert.strictEqual(decoded.missionId, payload.missionId);
    assert.strictEqual(decoded.nodes.length, 1);
    assert.strictEqual(decoded.nodes[0].id, 'test-node-1');
    assert.strictEqual(decoded.scenarios.length, 1);
    assert.strictEqual(decoded.scenarios[0].id, 'sc-1');
  });

  it('should handle unicode and special characters gracefully', () => {
    const payload: WorkflowSharePayload = {
      v: 1,
      missionId: 'multilingual-bot',
      missionTitle: '国際サポート 🤖',
      nodes: [
        {
          id: 'node-special',
          type: 'ai_classifier',
          title: 'Classification 分類 & Évaluation',
          description: 'Handles accents: é, è, ü, ñ, and emojis: 🚀',
          position: { x: 0, y: 0 },
          nextNodes: [],
          status: 'idle',
          config: {
            userPromptTemplate: 'Analyze: {{trigger.payload.message}} with 100% precision.',
          },
        },
      ],
      scenarios: [],
      createdAt: Date.now(),
    };

    const encoded = encodeWorkflowConfig(payload);
    const decoded = decodeWorkflowConfig(encoded);
    assert.ok(decoded);
    assert.strictEqual(decoded.missionTitle, '国際サポート 🤖');
    assert.strictEqual(decoded.nodes[0].title, 'Classification 分類 & Évaluation');
  });

  it('should return null for corrupted or invalid payload strings', () => {
    assert.strictEqual(decodeWorkflowConfig(''), null);
    assert.strictEqual(decodeWorkflowConfig('invalid-garbage-base64@@@!'), null);
    assert.strictEqual(decodeWorkflowConfig('bm90LWpzb24='), null);
  });
});
