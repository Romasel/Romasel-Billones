/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AutomationNode, ContextVariableItem } from '../types/pipeline';

/**
 * Derives a comprehensive list of global context variables available across
 * the pipeline, along with educational demo explanations and prompt engineering tips.
 */
export function extractGlobalContextVariables(
  nodes: AutomationNode[],
  triggerPayload: Record<string, any>
): ContextVariableItem[] {
  const items: ContextVariableItem[] = [];

  // 1. Ingest Trigger Payload Variables
  if (triggerPayload && typeof triggerPayload === 'object') {
    for (const [key, val] of Object.entries(triggerPayload)) {
      const fullKey = `trigger.payload.${key}`;
      const dataType: ContextVariableItem['dataType'] = Array.isArray(val)
        ? 'array'
        : typeof val === 'object' && val !== null
        ? 'object'
        : typeof val === 'number'
        ? 'number'
        : typeof val === 'boolean'
        ? 'boolean'
        : 'string';

      let explanation = `Ingested payload field '${key}' received at the start of the automation pipeline.`;
      let promptTip = `Inject into user prompt templates as {{${fullKey}}} to pass the user's raw message or metadata.`;

      if (key === 'senderName' || key === 'name' || key === 'leadName') {
        explanation = 'The verified name of the customer, prospect, or sender extracted from inbound event metadata.';
        promptTip = 'Use in personalized greetings (e.g., "Dear {{' + fullKey + '}},") to maintain high conversational warmth.';
      } else if (key === 'senderEmail' || key === 'email' || key === 'leadEmail') {
        explanation = 'The reply-to or webhook destination email address for customer dispatch.';
        promptTip = 'Reference in the final action step destination field (e.g., destination: {{' + fullKey + '}}).';
      } else if (key === 'subject') {
        explanation = 'The inbound message subject header, indicating the high-level intent of the request.';
        promptTip = 'Pass into classifier prompts to prioritize triage before reading full message bodies.';
      } else if (key === 'body' || key === 'rawText') {
        explanation = 'The complete, unformatted inbound text body or document OCR dump.';
        promptTip = 'Wrap inside XML delimiters (<CUSTOMER_MESSAGE>{{' + fullKey + '}}</CUSTOMER_MESSAGE>) to defend against prompt injection.';
      } else if (key === 'orderId' || key === 'invoiceNumber') {
        explanation = 'Unique transactional reference identifier for database lookup and verification.';
        promptTip = 'Always include in resolution drafts so the recipient can correlate with their financial records.';
      }

      items.push({
        key: fullKey,
        templateTag: `{{${fullKey}}}`,
        sourceNodeId: 'node_trigger',
        sourceNodeTitle: 'Inbound Event Trigger',
        sourceNodeType: 'trigger',
        dataType,
        currentValue: val,
        demoExplanation: explanation,
        promptUsageTip: promptTip,
      });
    }
  }

  // 2. Ingest Downstream Node Outputs
  for (const node of nodes) {
    if (node.type === 'trigger') continue;

    const res = node.executionResult?.output;

    if (node.type === 'ai_classifier') {
      items.push({
        key: `${node.id}.output.category`,
        templateTag: `{{${node.id}.output.category}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.category || 'billing_refund',
        demoExplanation:
          'Structured enumeration category output by the AI classifier (e.g., billing_refund, technical_bug, compliment_feedback).',
        promptUsageTip:
          'Use in conditional router nodes (operator: equals, value: billing_refund) to branch workflows deterministically.',
      });

      items.push({
        key: `${node.id}.output.sentiment`,
        templateTag: `{{${node.id}.output.sentiment}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.sentiment || 'negative',
        demoExplanation:
          'Detected customer emotional valence (positive, neutral, negative, urgent_negative).',
        promptUsageTip:
          'Feed into response generator system prompts to dynamically modulate empathy and urgency.',
      });

      items.push({
        key: `${node.id}.output.urgency`,
        templateTag: `{{${node.id}.output.urgency}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.urgency || 'high',
        demoExplanation:
          'Operational priority score rating (low, medium, high, critical).',
        promptUsageTip:
          'Use to route high-priority tickets to immediate on-call notification channels (Slack, PagerDuty).',
      });

      items.push({
        key: `${node.id}.output.confidence`,
        templateTag: `{{${node.id}.output.confidence}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'number',
        currentValue: res?.confidence ?? 0.94,
        demoExplanation:
          'Statistical certainty score (0.00 to 1.00) produced by the classifier or logit probabilities.',
        promptUsageTip:
          'Establish a human-in-the-loop threshold: If confidence < 0.85, route ticket to human review queue.',
      });
    } else if (node.type === 'ai_extractor') {
      items.push({
        key: `${node.id}.output.totalAmount`,
        templateTag: `{{${node.id}.output.totalAmount}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'number',
        currentValue: res?.totalAmount ?? 1450.0,
        demoExplanation:
          'Normalized numeric grand total extracted from OCR documents or invoice tables.',
        promptUsageTip:
          'Condition on numeric limits (e.g., totalAmount > 5000) to trigger secondary managerial signoff rules.',
      });

      items.push({
        key: `${node.id}.output.mathVerificationPassed`,
        templateTag: `{{${node.id}.output.mathVerificationPassed}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'boolean',
        currentValue: res?.mathVerificationPassed ?? true,
        demoExplanation:
          'Boolean mathematical verification ensuring (subtotal + taxAmount == totalAmount) without rounding drift.',
        promptUsageTip:
          'Block automated accounting database synchronization if mathVerificationPassed is false to prevent accounting errors.',
      });
    } else if (node.type === 'ai_generator') {
      items.push({
        key: `${node.id}.output.messageBody`,
        templateTag: `{{${node.id}.output.messageBody}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue:
          res?.messageBody ||
          'Dear Customer, Thank you for reaching out. We have initiated a full credit review...',
        demoExplanation:
          'The finalized, AI-drafted reply or executive research synthesis.',
        promptUsageTip:
          'Pass into downstream dispatch action payload template as the email or article body parameter.',
      });

      items.push({
        key: `${node.id}.output.subject`,
        templateTag: `{{${node.id}.output.subject}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.subject || 'Update regarding your account inquiry [Billing Review]',
        demoExplanation:
          'Clean, context-aware email subject line generated for the outbound response.',
        promptUsageTip:
          'Use in outbound email headers to provide clean threading and clear ticket categorization.',
      });
    } else if (node.type === 'condition') {
      items.push({
        key: `${node.id}.output.branchSelected`,
        templateTag: `{{${node.id}.output.branchSelected}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.branchSelected || 'TRUE branch',
        demoExplanation:
          'Active branch decision recorded during conditional evaluation.',
        promptUsageTip:
          'Log in audit records to trace why a specific customer journey path was selected.',
      });
    } else if (
      node.type === 'action_email' ||
      node.type === 'action_webhook' ||
      node.type === 'action_database'
    ) {
      items.push({
        key: `${node.id}.output.confirmationId`,
        templateTag: `{{${node.id}.output.confirmationId}}`,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        sourceNodeType: node.type,
        dataType: 'string',
        currentValue: res?.confirmationId || 'DISP-A8921Z',
        demoExplanation:
          'Receipt or transaction reference returned by the external API, CRM, or SMTP mail server.',
        promptUsageTip:
          'Store in internal database logs for end-to-end tracing and webhook idempotency checks.',
      });
    }
  }

  return items;
}
