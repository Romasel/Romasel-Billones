/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestScenario, TrainingMission } from '../types/pipeline';

export interface PromptInspiration {
  title: string;
  badge: string;
  prompt: string;
  tone: 'urgent' | 'standard' | 'edge_case' | 'discrepancy';
}

export const MISSION_PROMPT_INSPIRATIONS: Record<string, PromptInspiration[]> = {
  customer_triage: [
    {
      title: 'Enterprise AWS Migration Stalled',
      badge: 'Urgent Bug',
      prompt:
        'An angry enterprise VIP customer (VP of DevOps) named Sophia Sterling at Apex Cloud complaining that their database migration pipeline stalled at 98% with timeout error 504 and demanding immediate executive callback before their SLA breach penalty hits.',
      tone: 'urgent',
    },
    {
      title: 'Double Billed Quarterly Subscription',
      badge: 'Billing Refund',
      prompt:
        'A customer named Carlos Mendez from Finova Labs was mistakenly double-billed $1,200 for their quarterly pro tier on invoice #INV-99482. They want an immediate charge reversal and credit receipt.',
      tone: 'edge_case',
    },
    {
      title: 'Praise & Feature Request from Designer',
      badge: 'Compliment',
      prompt:
        'A happy lead UX designer named Chloe Martin at PixelFlow sent a glowing note thanking the team for the new node editor, saying it shaved 6 hours off their weekly workflow, and asking about upcoming Dark Mode themes.',
      tone: 'standard',
    },
    {
      title: 'Legal Escalation & Data Deletion Request',
      badge: 'Compliance Escalation',
      prompt:
        'A GDPR compliance officer from a European firm demanding formal proof of data deletion within 24 hours under threat of legal action to regulatory authorities.',
      tone: 'urgent',
    },
  ],
  invoice_extractor: [
    {
      title: 'High-Value GPU Lease ($18,400)',
      badge: 'Hardware Capital',
      prompt:
        'An unformatted PDF scan from NVIDIA Cloud Partner "HyperCompute Corp" for 4x HGX H200 GPU nodes for 1 month at $16,000 subtotal plus 15% state sales tax ($2,400) totaling $18,400.00 with Net 30 payment terms.',
      tone: 'standard',
    },
    {
      title: 'Math Invariant Discrepancy (Drift Bug)',
      badge: 'Validation Failure',
      prompt:
        'An invoice from Nordic Freight Logistics with Subtotal $4,200.00 and VAT Tax $420.00, but the total mistakenly prints $5,120.00 due to an OCR scan corruption. The math invariant check should fail.',
      tone: 'discrepancy',
    },
    {
      title: 'International Contractor in EUR',
      badge: 'Multi-Currency',
      prompt:
        'A consulting statement from Berlin Software Werkstatt GmbH for 80 hours of senior distributed systems architecture at €140/hr totaling €11,200 with reverse charge VAT 0% on invoice #BSW-2026-081.',
      tone: 'edge_case',
    },
    {
      title: 'Micro-Expense Coffee & Catering',
      badge: 'Small Expense',
      prompt:
        'A quick receipt scan for office all-hands catering from Blue Bottle Coffee for $142.50 including $12.50 city meal tax and $20 gratuity.',
      tone: 'standard',
    },
  ],
  lead_qualifier: [
    {
      title: 'Fortune 500 Global Bank CTO',
      badge: 'Tier 1 Enterprise',
      prompt:
        'Inbound demo inquiry from CTO Marcus Holloway at First Horizon Global Bank (4,500 employees). Their security ops team spends 300 hours every month manually triaging phishing incidents. Looking for enterprise POC with SOC2 Type II.',
      tone: 'urgent',
    },
    {
      title: 'Early Stage Solo Founder',
      badge: 'Self-Serve Starter',
      prompt:
        'Inbound demo request from a solo founder building an AI audio app (2 employees) asking if there is a free sandbox tier to test webhooks on weekends.',
      tone: 'standard',
    },
    {
      title: 'Mid-Market E-Commerce VP RevOps',
      badge: 'Mid-Market Growth',
      prompt:
        'VP of Revenue Operations at a direct-to-consumer apparel brand with 180 employees currently evaluating Zapier and Make.com migrations to AI pipelines with an annual budget of $45,000.',
      tone: 'standard',
    },
    {
      title: 'Anonymous Suspicious Submission',
      badge: 'Spam / Disqualified',
      prompt:
        'A contact form submission with name "asdf" and email "test1234@tempmail.ninja" stating "give me free API keys".',
      tone: 'edge_case',
    },
  ],
  multi_agent_factcheck: [
    {
      title: 'Superconducting Qubit Coherence Limits',
      badge: 'Deep Tech Physics',
      prompt:
        'Research briefing on 2026 transmon qubit coherence time extensions past 1.5 milliseconds using tantalum capacitors, with citations from Nature Physics and arXiv 2603.04891.',
      tone: 'standard',
    },
    {
      title: 'Hallucinated Medical Diagnostic Claim',
      badge: 'Adversarial Critic Test',
      prompt:
        'A draft paper claiming that a 7-parameter blood biomarker test has 100.0% zero-false-positive diagnostic accuracy for pancreatic adenocarcinoma in Phase III trials.',
      tone: 'discrepancy',
    },
    {
      title: 'Autonomous Vehicle Vision Benchmark',
      badge: 'Perception AI',
      prompt:
        'Technical report analyzing 4D radar-camera fusion benchmarks in torrential rain scenarios citing Waymo and Cruise research datasets from IEEE IV 2026.',
      tone: 'standard',
    },
  ],
  custom_sandbox: [
    {
      title: 'Shopify Checkout Completed Webhook',
      badge: 'E-Commerce',
      prompt:
        'A webhook event payload from Shopify with customer order #9821 containing 2 items, shipping address in Austin TX, discount code SUMMER26, and $189.00 payment confirmation.',
      tone: 'standard',
    },
    {
      title: 'Datadog High Memory Alert Trigger',
      badge: 'DevOps Incident',
      prompt:
        'Production alert payload from Kubernetes cluster pod worker-queue-88 firing because heap memory consumption reached 96.4% for over 5 minutes.',
      tone: 'urgent',
    },
  ],
};

/**
 * Intelligent entity extractor and natural language synthesizer for test scenarios.
 */
export function generateTestScenarioFromPrompt(
  prompt: string,
  mission: TrainingMission,
  mode: 'standard' | 'stress_test' | 'discrepancy' = 'standard'
): TestScenario {
  const p = prompt.trim();
  const lower = p.toLowerCase();
  const timestamp = Date.now();
  const id = `scenario_gen_${timestamp}`;

  // Helper regex extractors
  const emailMatch = p.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const moneyMatch = p.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
  const eurMatch = p.match(/€([0-9,]+(?:\.[0-9]{2})?)/);
  const invoiceMatch = p.match(/(?:invoice|inv)[\s#:]*([A-Za-z0-9_-]+)/i);

  // 1. Mission: Customer Support Auto-Triage
  if (mission.id === 'customer_triage') {
    let senderName = 'Alex Mercer';
    if (lower.includes('sophia sterling')) senderName = 'Sophia Sterling';
    else if (lower.includes('carlos mendez')) senderName = 'Carlos Mendez';
    else if (lower.includes('chloe martin')) senderName = 'Chloe Martin';
    else if (lower.includes('marcus')) senderName = 'Marcus Holloway';
    else {
      const nameMatch = p.match(/named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch) senderName = nameMatch[1];
    }

    const domain = lower.includes('apex')
      ? 'apexcloud.io'
      : lower.includes('finova')
      ? 'finovalabs.com'
      : lower.includes('pixelflow')
      ? 'pixelflow.design'
      : 'enterprise-client.com';

    const senderEmail =
      emailMatch?.[1] ||
      `${senderName.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

    let subject = 'Urgent assistance needed regarding our production account';
    let expectedCategory = 'general_inquiry';
    let expectedOutcomeNotice = 'Routes to General Operations & logs ticket';

    if (
      lower.includes('refund') ||
      lower.includes('bill') ||
      lower.includes('double') ||
      lower.includes('charge') ||
      lower.includes('invoice')
    ) {
      subject = `Urgent: Duplicate billing on ${invoiceMatch ? invoiceMatch[0] : 'Invoice #INV-99482'}`;
      expectedCategory = 'billing_refund';
      expectedOutcomeNotice = 'Should route to Billing Team & draft credit confirmation';
    } else if (
      lower.includes('stall') ||
      lower.includes('outage') ||
      lower.includes('timeout') ||
      lower.includes('504') ||
      lower.includes('500') ||
      lower.includes('bug') ||
      lower.includes('crash')
    ) {
      subject = 'CRITICAL SEV-1: Pipeline stalled at 98% (HTTP 504 Gateway Timeout)';
      expectedCategory = 'technical_bug';
      expectedOutcomeNotice = 'Should route to Technical Escalation & alert on-call engineer';
    } else if (
      lower.includes('praise') ||
      lower.includes('thank') ||
      lower.includes('love') ||
      lower.includes('great') ||
      lower.includes('awesome')
    ) {
      subject = 'Kudos from our design team: Loving the new node editor!';
      expectedCategory = 'compliment_feedback';
      expectedOutcomeNotice = 'Should route to Community & send warm thank-you note';
    } else if (
      lower.includes('legal') ||
      lower.includes('gdpr') ||
      lower.includes('lawyer') ||
      lower.includes('sue') ||
      lower.includes('compliance')
    ) {
      subject = 'LEGAL NOTICE: Formal GDPR Data Erasure Demand within 24 Hours';
      expectedCategory = 'urgent_escalation';
      expectedOutcomeNotice = 'Triggers immediate Legal & Compliance escalation flag';
    }

    const accountTier =
      mode === 'stress_test' || lower.includes('enterprise') || lower.includes('vip')
        ? 'Enterprise VIP'
        : lower.includes('pro')
        ? 'Pro Growth'
        : 'Standard Starter';

    const orderId = invoiceMatch ? invoiceMatch[1] : `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const body = p.length > 50 ? p : `Hello Support Team,\n\n${p}\n\nWe require an urgent response as this is impacting our daily workflow.\n\nRegards,\n${senderName}`;

    return {
      id,
      label: `Wizard: ${subject.slice(0, 38)}...`,
      description: `Generated from prompt: "${p.slice(0, 80)}..."`,
      expectedCategory,
      expectedOutcomeNotice,
      payload: {
        senderName,
        senderEmail,
        subject,
        body,
        accountTier,
        orderId,
      },
    };
  }

  // 2. Mission: Intelligent Document & Invoice Extractor
  if (mission.id === 'invoice_extractor') {
    const rawAmountNum = moneyMatch
      ? parseFloat(moneyMatch[1].replace(/,/g, ''))
      : eurMatch
      ? parseFloat(eurMatch[1].replace(/,/g, ''))
      : 4250.0;

    const currency = eurMatch ? 'EUR' : 'USD';
    const currSymbol = eurMatch ? '€' : '$';

    const invoiceNumber = invoiceMatch
      ? `INV-${invoiceMatch[1].toUpperCase()}`
      : `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let vendor = 'HyperCompute Technologies Corp.';
    if (lower.includes('nordic')) vendor = 'Nordic Freight Logistics ApS';
    else if (lower.includes('berlin')) vendor = 'Berlin Software Werkstatt GmbH';
    else if (lower.includes('blue bottle')) vendor = 'Blue Bottle Coffee Co.';

    let subtotal = Math.round(rawAmountNum * 0.9 * 100) / 100;
    let tax = Math.round((rawAmountNum - subtotal) * 100) / 100;
    let total = rawAmountNum;

    // If discrepancy mode or prompt mentions math discrepancy:
    const isDiscrepancy =
      mode === 'discrepancy' ||
      lower.includes('discrepancy') ||
      lower.includes('math error') ||
      lower.includes('mismatch');

    if (isDiscrepancy) {
      total = Math.round((rawAmountNum + 700.0) * 100) / 100; // Intentionally broken math
    }

    const rawText = [
      `INVOICE #${invoiceNumber}`,
      `Date: 2026-10-25`,
      `Vendor: ${vendor}`,
      `Tax ID: EU-99401827`,
      `Bill To: Acme Automation Labs Inc.`,
      `Line Item 1: High-Performance GPU Compute Instances (4x Clusters) - ${currSymbol}${subtotal.toFixed(2)}`,
      `Subtotal: ${currSymbol}${subtotal.toFixed(2)}`,
      `Sales Tax (10%): ${currSymbol}${tax.toFixed(2)}`,
      `Total Due: ${currSymbol}${total.toFixed(2)}`,
      `Payment Terms: Net 30`,
      `Currency: ${currency}`,
      isDiscrepancy ? `[OCR WARNING: Discrepancy detected between line sum and printed total]` : `Status: Cleared for payment`,
    ].join('\n');

    return {
      id,
      label: `Wizard: ${vendor} (${currSymbol}${total.toLocaleString()})`,
      description: `Synthesized OCR document from: "${p.slice(0, 70)}..."`,
      expectedCategory: total > 5000 ? 'hardware_capital' : 'software_infrastructure',
      expectedOutcomeNotice: isDiscrepancy
        ? 'Math check should FAIL (Subtotal + Tax != Total)'
        : total > 5000
        ? 'Amount > $5k triggers secondary CFO approval gate'
        : 'Clean ledger validation passes',
      payload: {
        documentType: 'PDF_OCR_SCAN',
        rawText,
        fileSizeKb: Math.floor(120 + Math.random() * 240),
      },
    };
  }

  // 3. Mission: B2B Lead Qualifier & Outreach Drafter
  if (mission.id === 'lead_qualifier') {
    let leadName = 'Marcus Holloway';
    let company = 'OrbitPay Global';
    let role = 'VP of Engineering';
    let companySize = '250-500 employees';
    let monthlyVolumeUsd = 15000000;

    if (lower.includes('founder') || lower.includes('solo') || lower.includes('bootstrap')) {
      leadName = 'Maya Lin';
      company = 'AuraAudio AI';
      role = 'Founder & CEO';
      companySize = '1-10 employees';
      monthlyVolumeUsd = 12000;
    } else if (lower.includes('bank') || lower.includes('cto') || lower.includes('fortune')) {
      leadName = 'David Vance';
      company = 'First Horizon Capital';
      role = 'Chief Technology Officer';
      companySize = '1,000-5,000 employees';
      monthlyVolumeUsd = 45000000;
    } else if (lower.includes('revops') || lower.includes('zapier')) {
      leadName = 'Sarah Jenkins';
      company = 'Vanguard Apparel D2C';
      role = 'VP of Revenue Operations';
      companySize = '100-250 employees';
      monthlyVolumeUsd = 3500000;
    }

    const leadEmail =
      emailMatch?.[1] ||
      `${leadName.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`;

    const currentPainPoint = p.length > 30 ? p : `Manual triage workflows consume 40+ engineering hours weekly.`;

    const isEnterprise = companySize.includes('500') || companySize.includes('1,000') || monthlyVolumeUsd > 10000000;

    return {
      id,
      label: `Wizard: ${leadName} (${company})`,
      description: `B2B Inbound prospect from: "${p.slice(0, 70)}..."`,
      expectedCategory: isEnterprise ? 'high_value_enterprise' : 'self_serve_starter',
      expectedOutcomeNotice: isEnterprise
        ? 'Score > 85, routes to Executive AE with personalized pitch'
        : 'Score < 50, routes to automated onboarding nurture track',
      payload: {
        leadName,
        leadEmail,
        company,
        companySize,
        role,
        currentPainPoint,
        monthlyVolumeUsd,
      },
    };
  }

  // 4. Mission: Multi-Agent Research & Fact-Check Loop
  if (mission.id === 'multi_agent_factcheck') {
    const researchTopic = p.length > 20 ? p : 'Quantum computing error correction thresholds in planar surface codes';
    const isAdversarial =
      mode === 'discrepancy' ||
      lower.includes('hallucin') ||
      lower.includes('false') ||
      lower.includes('disputed') ||
      lower.includes('100%');

    const sources = isAdversarial
      ? [
          'Preprint ArXiv:2603.99120 - Claim of room-temperature unshielded quantum memory (Unverified peer review)',
          'Press release statement with zero replication dataset published',
        ]
      : [
          'Nature Quantum Information 2026: Sub-threshold error rate verified on 127 physical qubits',
          'Physical Review Letters Vol 132: Fast syndrome extraction circuit with 1.2 microsecond cycle time',
        ];

    return {
      id,
      label: `Wizard: ${researchTopic.slice(0, 36)}...`,
      description: `Research brief from: "${p.slice(0, 70)}..."`,
      expectedCategory: 'quantum_computing',
      expectedOutcomeNotice: isAdversarial
        ? 'Critic Agent should flag unsupported assertions and drop confidence'
        : 'Critic Agent should corroborate claims against peer-reviewed citations',
      payload: {
        researchTopic,
        sources,
        requester: 'Principal AI Architect',
      },
    };
  }

  // 5. Fallback / Custom Sandbox
  const genericPayload: Record<string, any> = {
    source: 'test_case_wizard',
    timestamp: new Date().toISOString(),
    event_type: lower.includes('order') ? 'checkout_completed' : lower.includes('alert') ? 'system_alert' : 'custom_event',
    summary: p,
    attributes: {
      urgency: mode === 'stress_test' ? 'critical' : 'normal',
      priority: mode === 'stress_test' ? 1 : 3,
      tags: ['ai_generated', 'wizard_test'],
    },
  };

  if (moneyMatch) {
    genericPayload.amount = parseFloat(moneyMatch[1].replace(/,/g, ''));
  }
  if (emailMatch) {
    genericPayload.contactEmail = emailMatch[1];
  }

  return {
    id,
    label: `Wizard: ${p.slice(0, 30)}...`,
    description: `Generated custom test case from: "${p.slice(0, 70)}..."`,
    expectedCategory: 'custom_test',
    expectedOutcomeNotice: 'Executes through custom automation nodes',
    payload: genericPayload,
  };
}
