/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AutomationNode, TestScenario } from '../types/pipeline';

export interface WorkflowSharePayload {
  v: number; // version 1
  missionId: string;
  missionTitle: string;
  nodes: AutomationNode[];
  scenarios: TestScenario[];
  activeScenarioId?: string;
  createdAt: number;
}

/**
 * Encodes workflow configuration (nodes and scenarios) into a URL-safe Base64 string.
 */
export function encodeWorkflowConfig(payload: WorkflowSharePayload): string {
  try {
    // Sanitize nodes to keep only clean workflow blueprint properties
    const sanitizedNodes = (payload.nodes || []).map((n) => ({
      id: String(n.id),
      type: n.type,
      title: String(n.title),
      description: String(n.description || ''),
      config: n.config || {},
      position: n.position || { x: 0, y: 0 },
      nextNodes: Array.isArray(n.nextNodes) ? n.nextNodes : [],
      status: 'idle' as const,
    }));

    const sanitizedScenarios = (payload.scenarios || []).map((s) => ({
      id: String(s.id),
      label: String(s.label),
      description: String(s.description || ''),
      payload: s.payload || {},
      expectedCategory: s.expectedCategory,
      expectedOutcomeNotice: s.expectedOutcomeNotice,
    }));

    const cleanPayload = {
      v: payload.v || 1,
      missionId: payload.missionId,
      missionTitle: payload.missionTitle,
      nodes: sanitizedNodes,
      scenarios: sanitizedScenarios,
      activeScenarioId: payload.activeScenarioId,
      createdAt: payload.createdAt || Date.now(),
    };

    // Safe circular replacer
    const seen = new WeakSet();
    const jsonString = JSON.stringify(cleanPayload, (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return undefined;
        if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) return undefined;
        if (value.$$typeof) return undefined;
        seen.add(value);
      }
      return value;
    });

    // Encode UTF-8 characters safely into Base64
    const utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    const base64 = btoa(utf8Bytes);
    // Convert to URL-safe base64: '+' -> '-', '/' -> '_', remove trailing '='
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode workflow payload:', err);
    throw new Error('Unable to encode workflow for sharing.');
  }
}

/**
 * Decodes a URL-safe Base64 string back into WorkflowSharePayload.
 */
export function decodeWorkflowConfig(encodedStr: string): WorkflowSharePayload | null {
  try {
    if (!encodedStr || typeof encodedStr !== 'string') return null;

    // Restore standard base64 padding & characters
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binaryString = atob(base64);
    const jsonString = decodeURIComponent(
      Array.prototype.map
        .call(binaryString, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.nodes)) {
      console.warn('Decoded workflow payload is missing required nodes array.');
      return null;
    }

    return parsed as WorkflowSharePayload;
  } catch (err) {
    console.error('Failed to decode workflow config from URL:', err);
    return null;
  }
}

/**
 * Builds the full shareable URL with the workflow query parameter.
 */
export function buildShareUrl(payload: WorkflowSharePayload): string {
  const encoded = encodeWorkflowConfig(payload);
  const url = new URL(window.location.href);
  url.searchParams.set('workflow', encoded);
  return url.toString();
}

/**
 * Inspects current window search params or given query string for shared workflow.
 */
export function getSharedWorkflowFromUrl(search = window.location.search): WorkflowSharePayload | null {
  const params = new URLSearchParams(search);
  const encoded = params.get('workflow') || params.get('config');
  if (!encoded) return null;
  return decodeWorkflowConfig(encoded);
}
