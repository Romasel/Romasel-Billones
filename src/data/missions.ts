/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrainingMission } from '../types/pipeline';

export const TRAINING_MISSIONS: TrainingMission[] = [
  {
    id: 'customer_triage',
    title: 'Customer Support Auto-Triage & Smart Responder',
    tagline: 'Route urgent tickets, extract customer sentiment, and draft empathetic replies',
    difficulty: 'Beginner',
    category: 'Customer Ops',
    description:
      'Learn the core pattern of AI automation: Ingest an incoming message, use an LLM classifier to extract structured intent & sentiment, branch conditionally based on urgency, and generate a hyper-personalized response.',
    learningKeynotes: [
      'Prompt chaining: feeding the output of a classifier into a conditional router and generator',
      'JSON output enforcement: structuring LLM responses into reliable schema objects',
      'Contextual injection: inserting customer variables like {{trigger.payload.senderName}} into prompts',
      'Zero dead-ends: ensuring every branch routes to an action or fallback handler',
    ],
    objectives: [
      {
        id: 'obj_intent',
        title: 'Classify Intent & Sentiment',
        description: 'AI Classifier extracts category and priority level from incoming email',
        testFunctionId: 'has_classified_intent',
      },
      {
        id: 'obj_routing',
        title: 'Conditional Branch Decision',
        description: 'Condition node evaluates whether the ticket is a billing/refund issue',
        testFunctionId: 'handled_refund_routing',
      },
      {
        id: 'obj_response',
        title: 'Draft Empathetic Resolution',
        description: 'AI Generator crafts a personalized reply referencing the specific issue',
        testFunctionId: 'generated_personalized_response',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_refund',
        label: 'Scenario A: Double Charged Invoice',
        description: 'Customer was billed twice and demands immediate refund',
        payload: {
          senderName: 'Elena Rostova',
          senderEmail: 'elena.rostova@techfrontier.io',
          subject: 'Unauthorized double-charge on Invoice #88291',
          body: 'Hello, I just saw two separate $450 charges on my credit card this morning for the same monthly license. This is unacceptable. Please refund the duplicate charge immediately!',
          accountTier: 'Enterprise',
          orderId: 'INV-88291',
        },
        expectedCategory: 'billing_refund',
        expectedOutcomeNotice: 'Should route to Billing Team & draft credit confirmation',
      },
      {
        id: 'scenario_bug',
        label: 'Scenario B: Production API Outage',
        description: 'Developer reports 500 error when querying the analytics endpoint',
        payload: {
          senderName: 'Marcus Vance',
          senderEmail: 'marcus@dataflow.dev',
          subject: 'Critical: 500 Internal Server Error on /v2/analytics',
          body: 'Hi support team, since 09:30 UTC our automated jobs are failing with HTTP 500 on the /v2/analytics endpoint. We are losing pipeline telemetry. Can someone inspect the cluster immediately?',
          accountTier: 'Growth',
          orderId: 'API-KEY-771',
        },
        expectedCategory: 'technical_bug',
        expectedOutcomeNotice: 'Should route to Technical Escalation & open engineering ticket',
      },
      {
        id: 'scenario_kudos',
        label: 'Scenario C: Positive Customer Feedback',
        description: 'User sharing appreciation for the new automation features',
        payload: {
          senderName: 'Chloe Bennett',
          senderEmail: 'chloe@designhub.co',
          subject: 'Loving the new workflow builder!',
          body: 'Just wanted to say thank you to the team for the new node editor. It cut our team onboarding time in half! Keep up the great work.',
          accountTier: 'Pro',
          orderId: 'ACC-1102',
        },
        expectedCategory: 'compliment_feedback',
        expectedOutcomeNotice: 'Should route to Community & send warm thank-you note',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Inbound Support Email',
        description: 'Listens for customer inquiries arriving at support@company.com',
        config: {
          triggerType: 'email',
          sourceName: 'support@company.com',
          samplePayload: {
            senderName: 'Elena Rostova',
            senderEmail: 'elena.rostova@techfrontier.io',
            subject: 'Unauthorized double-charge on Invoice #88291',
            body: 'Hello, I just saw two separate $450 charges on my credit card this morning for the same monthly license. This is unacceptable. Please refund the duplicate charge immediately!',
            accountTier: 'Enterprise',
            orderId: 'INV-88291',
          },
        },
        position: { x: 40, y: 160 },
        nextNodes: ['node_classifier'],
        status: 'idle',
      },
      {
        id: 'node_classifier',
        type: 'ai_classifier',
        title: 'Intent & Sentiment Triage AI',
        description: 'Extracts category, urgency rating, and sentiment tone into JSON',
        config: {
          systemPrompt:
            'You are an expert customer operations triage agent. Analyze the inbound email and return a JSON object with category (billing_refund, technical_bug, compliment_feedback, general_inquiry), sentiment (positive, neutral, negative, urgent_negative), urgency (low, medium, high, critical), and a 1-sentence reasoning.',
          userPromptTemplate:
            'Sender: {{trigger.payload.senderName}}\nSubject: {{trigger.payload.subject}}\nMessage Body:\n{{trigger.payload.body}}',
          model: 'gemini-2.5-flash',
          temperature: 0.1,
          outputFormat: 'json',
          expectedJsonSchema: '{"category": "string", "sentiment": "string", "urgency": "string", "confidence": "number"}',
        },
        position: { x: 300, y: 160 },
        nextNodes: ['node_router'],
        status: 'idle',
      },
      {
        id: 'node_router',
        type: 'condition',
        title: 'Route: Is Billing or Refund?',
        description: 'Branches ticket workflow depending on category',
        config: {
          variablePath: 'node_classifier.output.category',
          operator: 'equals',
          targetValue: 'billing_refund',
          trueNextNodeId: 'node_billing_responder',
          falseNextNodeId: 'node_general_responder',
        },
        position: { x: 580, y: 160 },
        nextNodes: ['node_billing_responder', 'node_general_responder'],
        status: 'idle',
      },
      {
        id: 'node_billing_responder',
        type: 'ai_generator',
        title: 'Refund & Billing Specialist AI',
        description: 'Generates an empathetic resolution with refund timeline',
        config: {
          systemPrompt:
            'You are a senior billing operations specialist. Draft an empathetic, prompt, and reassuring reply acknowledging the billing concern, stating that duplicate review has been initiated, and providing a 1-2 business day resolution window.',
          userPromptTemplate:
            'Customer Name: {{trigger.payload.senderName}}\nOrder ID: {{trigger.payload.orderId}}\nCustomer Message: {{trigger.payload.body}}\nClassification: {{node_classifier.output.category}}',
          model: 'gemini-2.5-flash',
          temperature: 0.3,
          outputFormat: 'json',
        },
        position: { x: 860, y: 80 },
        nextNodes: ['node_send_email'],
        status: 'idle',
      },
      {
        id: 'node_general_responder',
        type: 'ai_generator',
        title: 'Standard Support Responder AI',
        description: 'Handles technical, general, and feedback inquiries',
        config: {
          systemPrompt:
            'You are a friendly customer success specialist. Draft a prompt, helpful reply directly answering questions and assuring the user their inquiry is in progress.',
          userPromptTemplate:
            'Customer Name: {{trigger.payload.senderName}}\nIssue Category: {{node_classifier.output.category}}\nMessage: {{trigger.payload.body}}',
          model: 'gemini-2.5-flash',
          temperature: 0.3,
          outputFormat: 'json',
        },
        position: { x: 860, y: 260 },
        nextNodes: ['node_send_email'],
        status: 'idle',
      },
      {
        id: 'node_send_email',
        type: 'action_email',
        title: 'Dispatch Email Reply',
        description: 'Sends the generated resolution to customer inbox',
        config: {
          actionType: 'send_email',
          destination: '{{trigger.payload.senderEmail}}',
          payloadTemplate: {
            to: '{{trigger.payload.senderEmail}}',
            subject: 'Re: {{trigger.payload.subject}}',
            body: '{{node_billing_responder.output.messageBody}}',
          },
        },
        position: { x: 1140, y: 160 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
  {
    id: 'invoice_extractor',
    title: 'Intelligent Document & Invoice Extractor',
    tagline: 'Transform messy unformatted invoice documents into structured, verified accounting ledger rows',
    difficulty: 'Intermediate',
    category: 'Finance & OCR',
    description:
      'Learn how automated document processing works: OCR data parsing, zero-shot entity extraction into standardized JSON, automatic mathematical discrepancy checks (subtotal + tax == total), and ERP ledger synchronization.',
    learningKeynotes: [
      'Structured extraction from semi-structured OCR text',
      'Mathematical invariant validation inside automation logic',
      'Anomaly detection: flagging mismatched vendor names or sum discrepancies',
      'Database upsert formatting for accounting databases',
    ],
    objectives: [
      {
        id: 'obj_extract',
        title: 'Extract Invoice Entities',
        description: 'Extract invoice number, line items, vendor, and amounts into structured schema',
        testFunctionId: 'has_classified_intent',
      },
      {
        id: 'obj_math',
        title: 'Validate Math Invariant',
        description: 'Verify that subtotal + tax equals total amount without rounding drift',
        testFunctionId: 'math_verification_checked',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_inv1',
        label: 'Invoice #1: Standard Server Infrastructure',
        description: 'Cloud compute invoice with clear line items and tax',
        payload: {
          documentType: 'PDF_OCR_SCAN',
          rawText:
            'INVOICE #INV-2026-9042\nDate: 2026-10-24\nVendor: CloudScale Systems Inc.\nTax ID: 94-8830192\nBill To: Acme Automation Labs\nLine Item 1: Dedicated GPU Clusters (H100) x 2 - $1,305.00\nSubtotal: $1,305.00\nSales Tax (10%): $145.00\nTotal Due: $1,450.00\nPayment Terms: Net 30',
          fileSizeKb: 142,
        },
        expectedCategory: 'software_infrastructure',
        expectedOutcomeNotice: 'Valid total $1,450.00, math check passes',
      },
      {
        id: 'scenario_inv2',
        label: 'Invoice #2: High-Value Equipment Purchase',
        description: 'Hardware invoice requiring secondary CFO approval flag',
        payload: {
          documentType: 'PDF_OCR_SCAN',
          rawText:
            'INVOICE #INV-2026-1188\nDate: 2026-10-21\nVendor: Applied Optics & Robotics Ltd.\nBill To: Acme Automation Labs\nLine Item 1: Industrial Vision Sensor Rig - $5,400.00\nSubtotal: $5,400.00\nTax: $600.00\nTotal Due: $6,000.00\nStatus: Pending Approval',
          fileSizeKb: 280,
        },
        expectedCategory: 'hardware_capital',
        expectedOutcomeNotice: 'Amount > $5,000 triggers secondary approval route',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Document Upload Event',
        description: 'Fired when accounts payable uploads a new vendor invoice',
        config: {
          triggerType: 'webhook',
          sourceName: 'accounts_payable_bucket',
          samplePayload: {
            documentType: 'PDF_OCR_SCAN',
            rawText:
              'INVOICE #INV-2026-9042\nDate: 2026-10-24\nVendor: CloudScale Systems Inc.\nBill To: Acme Automation Labs\nLine Item 1: Dedicated GPU Clusters x 2 - $1,305.00\nSubtotal: $1,305.00\nSales Tax: $145.00\nTotal Due: $1,450.00',
            fileSizeKb: 142,
          },
        },
        position: { x: 50, y: 160 },
        nextNodes: ['node_extractor'],
        status: 'idle',
      },
      {
        id: 'node_extractor',
        type: 'ai_extractor',
        title: 'Document Intelligence Extractor',
        description: 'Parses raw text into validated schema with line items & math verification',
        config: {
          systemPrompt:
            'You are a specialized accounting extraction engine. Parse the document text into a strictly typed JSON object containing invoiceNumber, vendor, date, lineItems, subtotal, taxAmount, totalAmount, and mathVerificationPassed.',
          userPromptTemplate: 'Document OCR Payload:\n{{trigger.payload.rawText}}',
          model: 'gemini-2.5-flash',
          temperature: 0.0,
          outputFormat: 'json',
        },
        position: { x: 350, y: 160 },
        nextNodes: ['node_db_sync'],
        status: 'idle',
      },
      {
        id: 'node_db_sync',
        type: 'action_database',
        title: 'Upsert to Accounting Ledger',
        description: 'Writes clean structured invoice into ERP database',
        config: {
          actionType: 'database_upsert',
          destination: 'postgres://production-erp/invoices',
          payloadTemplate: {
            invoice_num: '{{node_extractor.output.invoiceNumber}}',
            vendor_name: '{{node_extractor.output.vendor}}',
            total_usd: '{{node_extractor.output.totalAmount}}',
            verified: '{{node_extractor.output.mathVerificationPassed}}',
          },
        },
        position: { x: 680, y: 160 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
  {
    id: 'lead_qualifier',
    title: 'Autonomous B2B Lead Qualifier & Outreach Drafter',
    tagline: 'Enrich inbound company data, score lead against ICP, and generate hyper-tailored pitch',
    difficulty: 'Intermediate',
    category: 'Sales & Growth',
    description:
      'Learn how modern revenue operations teams leverage AI agents: Automatically qualify inbound demo requests against an Ideal Customer Profile (ICP), synthesize company pain points, and write custom tailored outreach.',
    learningKeynotes: [
      'Lead scoring logic and rubric matching',
      'Dynamic persona-matching prompt techniques',
      'Handling high-value enterprise routing vs automated self-serve nurture',
    ],
    objectives: [
      {
        id: 'obj_qualify',
        title: 'Score Lead against ICP',
        description: 'Calculate lead score and identify key enterprise growth signals',
        testFunctionId: 'has_classified_intent',
      },
      {
        id: 'obj_outreach',
        title: 'Generate Tailored Email',
        description: 'Draft personalized pitch referencing company size and technical stack',
        testFunctionId: 'generated_personalized_response',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_enterprise',
        label: 'Lead 1: VP of Engineering at Fintech (Series B)',
        description: 'High value enterprise account with 250 employees',
        payload: {
          leadName: 'Julian Croft',
          leadEmail: 'julian@orbitpay.finance',
          company: 'OrbitPay',
          companySize: '150-500 employees',
          role: 'VP of Engineering',
          currentPainPoint: 'We spend 40 hours a week manually reconciling cross-border payments across 14 banking portals.',
          monthlyVolumeUsd: 12000000,
        },
        expectedCategory: 'high_value_enterprise',
        expectedOutcomeNotice: 'Score 95/100, routes to Enterprise Account Executive',
      },
      {
        id: 'scenario_seed',
        label: 'Lead 2: Early-Stage Founder',
        description: 'Solo founder exploring starter automation plan',
        payload: {
          leadName: 'Samira Chen',
          leadEmail: 'samira@nanobrew.co',
          company: 'NanoBrew',
          companySize: '1-10 employees',
          role: 'Founder',
          currentPainPoint: 'Looking for a simple way to auto-respond to order questions.',
          monthlyVolumeUsd: 15000,
        },
        expectedCategory: 'self_serve_starter',
        expectedOutcomeNotice: 'Score 45/100, routes to automated self-serve trial flow',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Inbound Demo Request Form',
        description: 'Fired when a prospect submits the website demo form',
        config: {
          triggerType: 'webhook',
          sourceName: 'typeform_demo_webhook',
          samplePayload: {
            leadName: 'Julian Croft',
            leadEmail: 'julian@orbitpay.finance',
            company: 'OrbitPay',
            companySize: '150-500 employees',
            role: 'VP of Engineering',
            currentPainPoint: 'We spend 40 hours a week manually reconciling cross-border payments across 14 banking portals.',
            monthlyVolumeUsd: 12000000,
          },
        },
        position: { x: 50, y: 160 },
        nextNodes: ['node_qualifier'],
        status: 'idle',
      },
      {
        id: 'node_qualifier',
        type: 'ai_classifier',
        title: 'ICP Scoring & Intent Analyzer',
        description: 'Calculates lead tier, urgency, and estimated annual contract value (ACV)',
        config: {
          systemPrompt:
            'You are an expert sales operations analyst. Score the lead from 0 to 100 based on company size, title seniority, and pain point urgency. Output a JSON object with leadScore, tier (Enterprise, MidMarket, Starter), and priority.',
          userPromptTemplate:
            'Lead Name: {{trigger.payload.leadName}}\nTitle: {{trigger.payload.role}}\nCompany: {{trigger.payload.company}} ({{trigger.payload.companySize}})\nPain Point: {{trigger.payload.currentPainPoint}}',
          model: 'gemini-2.5-flash',
          temperature: 0.1,
          outputFormat: 'json',
        },
        position: { x: 340, y: 160 },
        nextNodes: ['node_outreach_gen'],
        status: 'idle',
      },
      {
        id: 'node_outreach_gen',
        type: 'ai_generator',
        title: 'Personalized Pitch Generator',
        description: 'Crafts high-converting, context-aware executive email',
        config: {
          systemPrompt:
            'You are a top-performing enterprise account executive. Draft a concise (under 120 words), value-focused message addressing the specific pain point directly without fluff.',
          userPromptTemplate:
            'Prospect: {{trigger.payload.leadName}} at {{trigger.payload.company}}\nPain Point: {{trigger.payload.currentPainPoint}}\nTier: {{node_qualifier.output.tier}}',
          model: 'gemini-2.5-flash',
          temperature: 0.3,
          outputFormat: 'json',
        },
        position: { x: 650, y: 160 },
        nextNodes: ['node_crm_sync'],
        status: 'idle',
      },
      {
        id: 'node_crm_sync',
        type: 'action_webhook',
        title: 'Sync to Salesforce / HubSpot',
        description: 'Posts qualified lead and drafted email into CRM',
        config: {
          actionType: 'webhook_post',
          destination: 'https://api.hubspot.com/crm/v3/objects/contacts',
          payloadTemplate: {
            email: '{{trigger.payload.leadEmail}}',
            score: '{{node_qualifier.output.confidence}}',
            drafted_email: '{{node_outreach_gen.output.messageBody}}',
          },
        },
        position: { x: 960, y: 160 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
  {
    id: 'multi_agent_factcheck',
    title: 'Multi-Agent Research & Fact-Check Loop',
    tagline: 'Generator-Critic architecture with citation verification and hallucination filter',
    difficulty: 'Advanced',
    category: 'Agentic Reasoning',
    description:
      'Master the Generator-Critic multi-agent pattern: One agent drafts research findings, a secondary Critic agent cross-checks assertions for accuracy and hallucination risks, and an automated gatekeeper only approves verified content.',
    learningKeynotes: [
      'Multi-agent consensus and hand-off patterns',
      'The Critic / Evaluator architecture for hallucination reduction',
      'Automated guardrails and content safety scoring',
    ],
    objectives: [
      {
        id: 'obj_draft',
        title: 'Synthesize Research Findings',
        description: 'Primary agent compiles structured summary with key takeaways',
        testFunctionId: 'has_classified_intent',
      },
      {
        id: 'obj_critic',
        title: 'Run Hallucination Audit',
        description: 'Critic agent validates factual claims and flags unverified assertions',
        testFunctionId: 'generated_personalized_response',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_research1',
        label: 'Research Prompt: Quantum Error Correction Breakthroughs',
        description: 'Dense technical paper summary requiring verification',
        payload: {
          researchTopic: 'Surface code quantum error correction benchmarks in 2026',
          sources: [
            'Physical Review Letters 2026: Sub-threshold error rates demonstrated in 127-qubit planar architecture',
            'Nature Quantum: Real-time syndrome decoding latency reduced to 1.2 microseconds',
          ],
          requester: 'Chief Scientist',
        },
        expectedCategory: 'quantum_computing',
        expectedOutcomeNotice: 'Critic verifies citations and checks physical bounds',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Research Request Trigger',
        description: 'Triggered when research query is submitted',
        config: {
          triggerType: 'manual',
          sourceName: 'research_portal',
          samplePayload: {
            researchTopic: 'Surface code quantum error correction benchmarks in 2026',
            sources: [
              'Physical Review Letters 2026: Sub-threshold error rates demonstrated',
              'Nature Quantum: Real-time syndrome decoding latency reduced to 1.2 microseconds',
            ],
            requester: 'Chief Scientist',
          },
        },
        position: { x: 50, y: 160 },
        nextNodes: ['node_researcher'],
        status: 'idle',
      },
      {
        id: 'node_researcher',
        type: 'ai_generator',
        title: 'Synthesis Agent (Author)',
        description: 'Drafts comprehensive technical briefing from sources',
        config: {
          systemPrompt:
            'You are a technical research scientist. Synthesize the provided topic and raw findings into a clear executive summary.',
          userPromptTemplate: 'Topic: {{trigger.payload.researchTopic}}\nSources: {{trigger.payload.sources}}',
          model: 'gemini-2.5-pro',
          temperature: 0.2,
          outputFormat: 'json',
        },
        position: { x: 350, y: 160 },
        nextNodes: ['node_critic'],
        status: 'idle',
      },
      {
        id: 'node_critic',
        type: 'ai_classifier',
        title: 'Fact-Check Agent (Critic)',
        description: 'Audits assertions against source materials and scores accuracy',
        config: {
          systemPrompt:
            'You are an adversarial fact-checking auditor. Read the drafted text, identify unsupported claims, and return an accuracy audit score and verification flag.',
          userPromptTemplate:
            'Draft to Audit: {{node_researcher.output.messageBody}}\nOriginal Sources: {{trigger.payload.sources}}',
          model: 'gemini-2.5-pro',
          temperature: 0.0,
          outputFormat: 'json',
        },
        position: { x: 670, y: 160 },
        nextNodes: ['node_publish_webhook'],
        status: 'idle',
      },
      {
        id: 'node_publish_webhook',
        type: 'action_webhook',
        title: 'Publish Verified Briefing',
        description: 'Posts verified report to internal knowledge base',
        config: {
          actionType: 'webhook_post',
          destination: 'https://kb.enterprise.internal/v1/articles',
          payloadTemplate: {
            topic: '{{trigger.payload.researchTopic}}',
            summary: '{{node_researcher.output.messageBody}}',
            audit_score: '{{node_critic.output.confidence}}',
          },
        },
        position: { x: 990, y: 160 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
  {
    id: 'custom_sandbox',
    title: 'Custom Automation Sandbox',
    tagline: 'Free canvas to build, configure, and test any custom AI automation from scratch',
    difficulty: 'Beginner',
    category: 'Sandbox',
    description:
      'Design your own custom AI workflow. Add triggers, classifiers, generative prompts, conditional decision trees, and export the finished pipeline to production JSON.',
    learningKeynotes: [
      'Complete creative freedom with custom nodes and connections',
      'Test with any custom JSON payload',
      'Export production-ready workflow schema',
    ],
    objectives: [
      {
        id: 'obj_custom_run',
        title: 'Execute Custom Pipeline',
        description: 'Run the custom automation pipeline successfully with valid sample payload',
        testFunctionId: 'has_classified_intent',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_custom_1',
        label: 'Default Custom Test Payload',
        description: 'Generic automation input payload',
        payload: {
          event: 'customer_signed_up',
          user: { name: 'Alex Rivera', plan: 'enterprise', seats: 25 },
          metadata: { ip: '192.168.1.1', country: 'US' },
        },
        expectedCategory: 'custom_event',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Custom Event Webhook',
        description: 'Incoming JSON event payload',
        config: {
          triggerType: 'webhook',
          sourceName: 'custom_endpoint',
          samplePayload: {
            event: 'customer_signed_up',
            user: { name: 'Alex Rivera', plan: 'enterprise', seats: 25 },
          },
        },
        position: { x: 50, y: 160 },
        nextNodes: ['node_ai_process'],
        status: 'idle',
      },
      {
        id: 'node_ai_process',
        type: 'ai_classifier',
        title: 'AI Decision Engine',
        description: 'Processes input and extracts structured insight',
        config: {
          systemPrompt: 'You are a general workflow intelligence engine.',
          userPromptTemplate: 'Analyze incoming event: {{trigger.payload.event}} for user: {{trigger.payload.user}}',
          model: 'gemini-2.5-flash',
          temperature: 0.2,
          outputFormat: 'json',
        },
        position: { x: 380, y: 160 },
        nextNodes: ['node_action'],
        status: 'idle',
      },
      {
        id: 'node_action',
        type: 'action_webhook',
        title: 'Webhook Dispatcher',
        description: 'Delivers downstream automation action',
        config: {
          actionType: 'webhook_post',
          destination: 'https://hooks.slack.com/services/custom-alert',
          payloadTemplate: {
            event: '{{trigger.payload.event}}',
            result: '{{node_ai_process.output.reasoning}}',
          },
        },
        position: { x: 720, y: 160 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
  {
    id: 'python_sklearn_classifier',
    title: 'Python Scikit-Learn Urgency Classifier Bot',
    tagline: 'Supervised ML model classifying incoming text entries into Urgent vs Not Urgent with entity extraction',
    difficulty: 'Intermediate',
    category: 'Customer Ops',
    description:
      'Train and run a scikit-learn TF-IDF + Naive Bayes text classification model. Classifies incoming text entries into Urgent vs Not Urgent, extracts contact emails and ticket IDs, and routes to on-call engineers or standard support.',
    learningKeynotes: [
      'TF-IDF vectorization with n-gram feature extraction',
      'Supervised text categorization with probability confidence scores',
      'Hybrid automation: Combining ML classification with regex entity extraction and automated dispatch',
    ],
    objectives: [
      {
        id: 'obj_py_classify',
        title: 'Classify Urgency via ML Model',
        description: 'Scikit-Learn model classifies text entry into Urgent or Not Urgent with confidence score',
        testFunctionId: 'has_classified_intent',
      },
      {
        id: 'obj_py_route',
        title: 'Branch on Urgency Level',
        description: 'Condition node routes Urgent entries to P1 Incident response',
        testFunctionId: 'handled_refund_routing',
      },
      {
        id: 'obj_py_log',
        title: 'Log Extracted Information',
        description: 'Log classification, detected entities, and actions to audit stream',
        testFunctionId: 'generated_personalized_response',
      },
    ],
    testScenarios: [
      {
        id: 'scenario_py_critical',
        label: 'Scenario A: Production Outage Alert',
        description: 'Database pool exhausted with 500 internal server error',
        payload: {
          senderEmail: 'ops@fintech.io',
          subject: 'CRITICAL ALERT: Database pool exhausted',
          body: 'CRITICAL ALERT: Database pool exhausted, 500 error on /checkout for order #ORD-44910!',
          severity: 'P1',
        },
        expectedCategory: 'Urgent',
        expectedOutcomeNotice: 'Predicted Urgent (82.9% conf) -> Escalates to P1 On-Call',
      },
      {
        id: 'scenario_py_routine',
        label: 'Scenario B: Routine Documentation Inquiry',
        description: 'User asking for documentation on export formats',
        payload: {
          senderEmail: 'linda@gmail.com',
          subject: 'Documentation inquiry',
          body: 'Hi there, my name is Linda (linda@gmail.com). Could you please send me documentation on export formats?',
          severity: 'Standard',
        },
        expectedCategory: 'Not Urgent',
        expectedOutcomeNotice: 'Predicted Not Urgent (79.5% conf) -> Routes to Standard Queue',
      },
    ],
    initialNodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Inbound Ticket Stream',
        description: 'Receives simulated text tickets and telemetry messages',
        config: {
          triggerType: 'webhook',
          sourceName: 'support_gateway',
          samplePayload: {
            senderEmail: 'ops@fintech.io',
            subject: 'CRITICAL ALERT: Database pool exhausted',
            body: 'CRITICAL ALERT: Database pool exhausted, 500 error on /checkout for order #ORD-44910!',
          },
        },
        position: { x: 50, y: 160 },
        nextNodes: ['node_sklearn_model'],
        status: 'idle',
      },
      {
        id: 'node_sklearn_model',
        type: 'ai_classifier',
        title: 'Scikit-Learn Urgency Model',
        description: 'TF-IDF + Naive Bayes pipeline classifying Urgent vs Not Urgent',
        config: {
          systemPrompt: 'Scikit-Learn ML Model: TF-IDF vectorizer + Multinomial Naive Bayes trained on 40 labeled samples.',
          userPromptTemplate: 'Input Text: {{trigger.payload.body}}',
          model: 'simulated-llm',
          temperature: 0.0,
          outputFormat: 'json',
          expectedJsonSchema: '{"classification": "Urgent | Not Urgent", "confidence": "float", "extracted_entities": {}}',
        },
        position: { x: 350, y: 160 },
        nextNodes: ['node_urgency_router'],
        status: 'idle',
      },
      {
        id: 'node_urgency_router',
        type: 'condition',
        title: 'Route: Is Ticket Urgent?',
        description: 'Branches based on predicted urgency classification',
        config: {
          variablePath: 'node_sklearn_model.output.sentiment',
          operator: 'equals',
          targetValue: 'negative',
          trueNextNodeId: 'node_p1_escalation',
          falseNextNodeId: 'node_standard_queue',
        },
        position: { x: 650, y: 160 },
        nextNodes: ['node_p1_escalation', 'node_standard_queue'],
        status: 'idle',
      },
      {
        id: 'node_p1_escalation',
        type: 'action_webhook',
        title: 'P1 Incident Escalation Dispatcher',
        description: 'Pagers on-call engineering team and logs to P1 channel',
        config: {
          actionType: 'webhook_post',
          destination: 'https://pagerduty.enterprise.internal/v1/incidents',
          payloadTemplate: {
            alert: '{{trigger.payload.body}}',
            classification: 'Urgent',
            action: 'Escalated to P1 Incident Desk',
          },
        },
        position: { x: 970, y: 80 },
        nextNodes: [],
        status: 'idle',
      },
      {
        id: 'node_standard_queue',
        type: 'action_database',
        title: 'Standard Queue Dispatcher',
        description: 'Appends to customer support database queue',
        config: {
          actionType: 'database_upsert',
          destination: 'postgres://support-db/tickets',
          payloadTemplate: {
            ticket: '{{trigger.payload.body}}',
            classification: 'Not Urgent',
            action: 'Routed to Standard Support Queue',
          },
        },
        position: { x: 970, y: 260 },
        nextNodes: [],
        status: 'idle',
      },
    ],
  },
];

