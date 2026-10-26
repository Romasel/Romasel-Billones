/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  FileCode,
  Terminal,
  Play,
  RotateCcw,
  Check,
  Copy,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
  Truck,
  Folder,
  MessageSquare,
  CloudSun,
  Video,
} from 'lucide-react';
import { ElCamionesSalesEngine } from './ElCamionesSalesEngine';
import { TutorialAndLinktree } from './TutorialAndLinktree';
import { FileOrganizerDemo } from './FileOrganizerDemo';
import { KeywordChatbotDemo } from './KeywordChatbotDemo';
import { WeatherFetcherDemo } from './WeatherFetcherDemo';

export const PythonBotsStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'elcamiones'
    | 'tutorial_linktree'
    | 'file_organizer'
    | 'keyword_bot'
    | 'weather_api'
    | 'classifier'
    | 'order_bot'
    | 'code'
  >('elcamiones');

  // --- TAB 1: Classifier State ---
  const [inputText, setInputText] = useState(
    'CRITICAL: Production database pool exhausted, 500 error on /checkout for order #ORD-44910!'
  );
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>({
    timestamp: new Date().toISOString(),
    raw_text:
      'CRITICAL: Production database pool exhausted, 500 error on /checkout for order #ORD-44910!',
    classification: 'Urgent',
    confidence_score: 0.829,
    extracted_information: {
      emails: ['ops@fintech.io'],
      order_ids: ['ORD-44910'],
      monetary_amounts: [],
      detected_urgent_keywords: ['error', '500', 'critical'],
      character_count: 92,
    },
    action_taken: 'Escalated to P1 Incident Desk & On-Call Specialist',
  });

  const [classificationLogs, setClassificationLogs] = useState<any[]>([
    {
      timestamp: '2026-10-26T03:03:43Z',
      raw_text:
        'CRITICAL: Production database pool exhausted, 500 error on /checkout for order #ORD-44910!',
      classification: 'Urgent',
      confidence_score: 0.829,
      extracted_information: {
        emails: ['ops@fintech.io'],
        order_ids: ['ORD-44910'],
        detected_urgent_keywords: ['error', '500', 'critical'],
      },
      action_taken: 'Escalated to P1 Incident Desk & On-Call Specialist',
    },
    {
      timestamp: '2026-10-26T03:03:44Z',
      raw_text:
        'Hi there, my name is Linda (linda@gmail.com). Could you please send me documentation on export formats?',
      classification: 'Not Urgent',
      confidence_score: 0.795,
      extracted_information: {
        emails: ['linda@gmail.com'],
        order_ids: [],
        detected_urgent_keywords: [],
      },
      action_taken: 'Routed to Standard Support Queue',
    },
  ]);

  const presetSamples = [
    {
      label: '500 DB Crash',
      text: 'CRITICAL ALERT: Database pool exhausted, 500 error on /checkout for order #ORD-44910!',
    },
    {
      label: 'Double Charge Refund',
      text: 'URGENT: Customer charged twice $1,250 on invoice #INV-8812! Please refund immediately or our card will be blocked.',
    },
    {
      label: 'Doc Ingestion Question',
      text: 'Hi there, my name is Linda (linda@gmail.com). Could you please send me documentation on export formats?',
    },
    {
      label: 'Warm Feedback',
      text: 'Just wanted to say thanks for the great customer service last week, everything is working smoothly now!',
    },
  ];

  const handleClassify = () => {
    setIsClassifying(true);

    setTimeout(() => {
      const lower = inputText.toLowerCase();
      // Scikit-learn simulated inference logic
      const isUrgent =
        lower.includes('critical') ||
        lower.includes('500') ||
        lower.includes('urgent') ||
        lower.includes('refund') ||
        lower.includes('error') ||
        lower.includes('down') ||
        lower.includes('unauthorized') ||
        lower.includes('fail');

      const emails =
        inputText.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g) || [];
      const orderIds =
        inputText.match(/(?:INV|ORD|TKT|REQ)-[0-9]+|#\d+/gi) || [];
      const keywords =
        inputText.match(
          /\b(critical|down|emergency|urgent|failing|error|500|crash|refund|unauthorized|breach|loss)\b/gi
        ) || [];

      const confidence = isUrgent
        ? 0.8 + Math.random() * 0.12
        : 0.75 + Math.random() * 0.14;

      const record = {
        timestamp: new Date().toISOString(),
        raw_text: inputText,
        classification: isUrgent ? 'Urgent' : 'Not Urgent',
        confidence_score: Math.round(confidence * 1000) / 1000,
        extracted_information: {
          emails: Array.from(new Set(emails)),
          order_ids: Array.from(new Set(orderIds)),
          detected_urgent_keywords: Array.from(
            new Set(keywords.map((k) => k.toLowerCase()))
          ),
          character_count: inputText.length,
        },
        action_taken: isUrgent
          ? 'Escalated to P1 Incident Desk & On-Call Specialist'
          : 'Routed to Standard Support Queue',
      };

      setClassificationResult(record);
      setClassificationLogs((prev) => [record, ...prev]);
      setIsClassifying(false);
    }, 280);
  };

  // --- TAB 2: Order Monitor Bot State ---
  const [streamContent, setStreamContent] = useState<string>(
    '# Incoming Event Stream\nSystem heartbeat ping\nORDER\nCloud Server Cluster Pro (SKU: CLOUD-889) - Qty: 2 - Total: $1,450.00\nUser navigated to billing page\n'
  );
  const [processedOrders, setProcessedOrders] = useState<string[]>([
    '[2026-10-26 03:04:10] Item: Cloud Server Cluster Pro (SKU: CLOUD-889) - Qty: 2 - Total: $1,450.00',
  ]);
  const [botLogs, setBotLogs] = useState<string[]>([
    '[03:04:05] Watching incoming_stream.txt every 5 seconds...',
    '[03:04:10] [+] DETECTED \'ORDER\' on line 3! Extracted next line.',
    '[03:04:10] Logged to processed_orders.txt',
    '[03:04:15] Check #2: Keyword \'ORDER\' not found. Waiting 5s...',
  ]);
  const [secondsUntilCheck, setSecondsUntilCheck] = useState<number>(5);
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [lastProcessedIndex, setLastProcessedIndex] = useState<number>(2);

  // Simulation timer for 5-second loop
  useEffect(() => {
    if (!isBotRunning) return;

    const timer = setInterval(() => {
      setSecondsUntilCheck((prev) => {
        if (prev <= 1) {
          // Perform 5-second check
          const lines = streamContent.split('\n');
          let found = false;

          for (let i = lastProcessedIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.toUpperCase().includes('ORDER')) {
              found = true;
              if (i + 1 < lines.length && lines[i + 1].trim()) {
                const nextLine = lines[i + 1].trim();
                const nowStr = new Date().toLocaleTimeString();
                const orderEntry = `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ${nextLine}`;
                setProcessedOrders((p) => [orderEntry, ...p]);
                setBotLogs((l) => [
                  `[${nowStr}] Logged to processed_orders.txt`,
                  `[${nowStr}] [+] DETECTED 'ORDER' on line ${i + 1}! Extracted: "${nextLine}"`,
                  ...l.slice(0, 18),
                ]);
                setLastProcessedIndex(i + 1);
              }
              break;
            }
          }

          if (!found) {
            const nowStr = new Date().toLocaleTimeString();
            setBotLogs((l) => [
              `[${nowStr}] Keyword 'ORDER' not found. Waiting 5s...`,
              ...l.slice(0, 18),
            ]);
          }

          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBotRunning, streamContent, lastProcessedIndex]);

  const handleInjectOrder = () => {
    const randomSkus = ['ENTERPRISE-GPU-8', 'API-TIER-UNLIMITED', 'DATADOG-MONITOR-PRO'];
    const sku = randomSkus[Math.floor(Math.random() * randomSkus.length)];
    const newText = `\nORDER\nCustomer Order #ORD-${Math.floor(1000 + Math.random() * 9000)}: ${sku} - Amount: $${(
      900 + Math.random() * 2000
    ).toFixed(2)}\n`;
    setStreamContent((prev) => prev + newText);
  };

  const handleInjectPing = () => {
    setStreamContent((prev) => prev + `User session ping at ${new Date().toLocaleTimeString()}\n`);
  };

  // --- TAB 3: Code View ---
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeSnippets = {
    train_classifier: `import csv, joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# 1. Build TF-IDF + Multinomial Naive Bayes Pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)),
    ("classifier", MultinomialNB(alpha=0.3)),
])

# 2. Train and export
pipeline.fit(X_train, y_train)
joblib.dump(pipeline, "urgency_model.joblib")`,

    urgency_bot: `import joblib, json, re
from datetime import datetime

model = joblib.load("urgency_model.joblib")

def process_ticket(text):
    pred = model.predict([text])[0]
    probs = model.predict_proba([text])[0]
    
    # Entity Extraction
    emails = re.findall(r"[\\w.-]+@[\\w.-]+", text)
    order_ids = re.findall(r"(?:INV|ORD|TKT)-[0-9]+", text, re.I)
    
    record = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "raw_text": text,
        "classification": pred,
        "confidence": float(max(probs)),
        "extracted_info": { "emails": emails, "order_ids": order_ids }
    }
    
    # Log to file
    with open("classification_logs.jsonl", "a") as f:
        f.write(json.dumps(record) + "\\n")
    return record`,

    order_monitor: `import time, os
from datetime import datetime

MONITOR_FILE = "incoming_stream.txt"
OUTPUT_FILE = "processed_orders.txt"

def monitor():
    processed_indices = set()
    while True:
        with open(MONITOR_FILE, "r") as f:
            lines = f.readlines()
        
        found = False
        for i, line in enumerate(lines):
            if "ORDER" in line.upper() and i not in processed_indices:
                processed_indices.add(i)
                if i + 1 < len(lines):
                    order_info = lines[i + 1].strip()
                    with open(OUTPUT_FILE, "a") as out:
                        out.write(f"[{datetime.now()}] {order_info}\\n")
                    print(f"Extracted: {order_info}")
                    found = True
        
        if not found:
            print("Keyword 'ORDER' not found. Waiting 5s...")
        time.sleep(5)`,

    file_organizer: `import os, shutil
from pathlib import Path

EXTENSION_MAP = {
    'Documents': ['.pdf', '.docx', '.txt', '.xlsx'],
    'Images': ['.jpg', '.jpeg', '.png', '.webp'],
    'Archives': ['.zip', '.tar', '.gz'],
    'Code': ['.py', '.js', '.ts', '.json']
}

def organize(folder_path):
    folder = Path(folder_path).resolve()
    for item in folder.iterdir():
        if item.is_dir(): continue
        ext = item.suffix.lower()
        dest = 'Others'
        for cat, exts in EXTENSION_MAP.items():
            if ext in exts: dest = cat; break
        dest_dir = folder / dest
        dest_dir.mkdir(exist_ok=True)
        shutil.move(str(item), str(dest_dir / item.name))
        print(f"Moved {item.name} -> {dest}/")

if __name__ == '__main__':
    organize("./downloads_inbox")`,

    keyword_chatbot: `import re

FAQ = {
    ("hours", "open", "time"): "We are open 24/7 for commercial emergency fleet roadside.",
    ("price", "quote", "cost"): "Fleet preventative maintenance starts at $189/truck.",
    ("emergency", "towing", "breakdown"): "Call priority hotline (708) 232-6581 immediately!",
    ("facebook", "contact", "questions"): "Visit: https://www.facebook.com/profile.php?id=61590527562517"
}

def reply(text):
    for keys, ans in FAQ.items():
        for k in keys:
            if re.search(rf'\\b{k}\\b', text.lower()): return ans
    return "Call (708) 232-6581 or visit https://www.facebook.com/profile.php?id=61590527562517"

while True:
    q = input("You: ")
    if q.lower() in ("exit", "quit"): break
    print("Bot:", reply(q))`,

    weather_fetcher: `import requests

def get_weather(city="Chicago"):
    # Geocoding via Open-Meteo
    geo = requests.get("https://geocoding-api.open-meteo.com/v1/search", params={"name": city, "count": 1}).json()
    loc = geo["results"][0]
    # Forecast
    w = requests.get("https://api.open-meteo.com/v1/forecast", params={
        "latitude": loc["latitude"], "longitude": loc["longitude"],
        "current": ["temperature_2m", "weather_code", "wind_speed_10m"], "wind_speed_unit": "mph"
    }).json()["current"]
    print(f"{loc['name']}: {w['temperature_2m']}°F, Wind: {w['wind_speed_10m']} mph")

if __name__ == "__main__":
    get_weather(input("City: ") or "Chicago")`,

    elcamiones_sales: `import time, smtplib
from email.mime.text import MIMEText

RECIPIENT_PHONE = "7082326581"
SENDER_GMAIL = "billonesromasel18@gmail.com"
COMPANY_EMAIL = "Romasel.b@elcamiones.com"
FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590527562517"
INTERVAL_MIN = 5

def dial_and_pitch(phone, company):
    print(f"[*] Dialing {phone} ({company}) via outbound trunk...")
    time.sleep(2)
    print(f"Connected! Outreach: {COMPANY_EMAIL} / {SENDER_GMAIL}. Inquiries -> {FACEBOOK_URL}")
    print(f"Pacing: Waiting {INTERVAL_MIN} minutes before next dial...")
    time.sleep(INTERVAL_MIN * 60)

if __name__ == "__main__":
    dial_and_pitch(RECIPIENT_PHONE, "Midwest Freight LLC")`,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Studio Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span className="font-mono text-sm">{'{py}'}</span>
              <span>Python Automation, Lead Gen & Sales Outbound Suite</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Python Automation Bots & elcamiones.com Sales Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Automated commercial fleet prospecting, personalized cold email outreach (billonesromasel18@gmail.com &amp; Romasel.b@elcamiones.com), 5–10 min Google Voice auto-dialer with test run on <strong>7082326581</strong>, SEO audit, Facebook link routing, interactive execution tutorial, file organizer, keyword chatbot, and weather API client.
            </p>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('elcamiones')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'elcamiones'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>elcamiones.com Sales Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('tutorial_linktree')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tutorial_linktree'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Execution Tutorial & Linktree</span>
            </button>

            <button
              onClick={() => setActiveTab('file_organizer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'file_organizer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>File Organizer</span>
            </button>

            <button
              onClick={() => setActiveTab('keyword_bot')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'keyword_bot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Keyword Chatbot</span>
            </button>

            <button
              onClick={() => setActiveTab('weather_api')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'weather_api'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Weather API</span>
            </button>

            <button
              onClick={() => setActiveTab('classifier')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'classifier'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>ML Classifier</span>
            </button>

            <button
              onClick={() => setActiveTab('order_bot')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'order_bot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Order Bot</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code Vault</span>
            </button>
          </div>
        </div>

        {/* TAB: elcamiones.com Sales Suite */}
        {activeTab === 'elcamiones' && <ElCamionesSalesEngine />}

        {/* TAB: Interactive Execution Tutorial & Linktree */}
        {activeTab === 'tutorial_linktree' && <TutorialAndLinktree />}

        {/* TAB: Directory File Organizer */}
        {activeTab === 'file_organizer' && <FileOrganizerDemo />}

        {/* TAB: Keyword-Matching Chatbot */}
        {activeTab === 'keyword_bot' && <KeywordChatbotDemo />}

        {/* TAB: Weather API Client */}
        {activeTab === 'weather_api' && <WeatherFetcherDemo />}

        {/* TAB 1: Scikit-Learn Urgency Classifier */}
        {activeTab === 'classifier' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Input & Preset Tester */}
              <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Simulated Inbound Message Entry:
                  </span>
                  <span className="text-xs text-indigo-400 font-mono">
                    Model: TF-IDF + MultinomialNB (80% Acc)
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {presetSamples.map((ps) => (
                    <button
                      key={ps.label}
                      onClick={() => setInputText(ps.text)}
                      className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                    >
                      {ps.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Type an email, alert, or customer message..."
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Extracts emails, ticket IDs, amounts, and predicts urgency.
                  </div>
                  <button
                    onClick={handleClassify}
                    disabled={isClassifying}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isClassifying ? 'Classifying...' : 'Classify & Extract'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Prediction & Entity Card */}
              <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Model Classification Result
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg font-mono ${
                      classificationResult.classification === 'Urgent'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {classificationResult.classification.toUpperCase()}
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Classification Confidence</span>
                    <span className="text-white font-bold tabular-nums">
                      {(classificationResult.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        classificationResult.classification === 'Urgent'
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${classificationResult.confidence_score * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Extracted Information */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                    Extracted Information:
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Contact Emails:</span>
                      <div className="font-mono text-indigo-300 mt-0.5 truncate">
                        {classificationResult.extracted_information.emails.length > 0
                          ? classificationResult.extracted_information.emails.join(', ')
                          : 'None detected'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Order/Ticket IDs:</span>
                      <div className="font-mono text-emerald-300 mt-0.5 truncate">
                        {classificationResult.extracted_information.order_ids.length > 0
                          ? classificationResult.extracted_information.order_ids.join(', ')
                          : 'None detected'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px]">Urgency Keywords:</span>
                    <div className="font-mono text-amber-300 text-[11px] mt-0.5">
                      {classificationResult.extracted_information.detected_urgent_keywords?.length > 0
                        ? classificationResult.extracted_information.detected_urgent_keywords.join(
                            ', '
                          )
                        : 'None detected'}
                    </div>
                  </div>
                </div>

                {/* Automated Action */}
                <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 text-xs">
                  <span className="text-slate-400 block text-[11px]">Automated Bot Action:</span>
                  <div className="font-semibold text-indigo-200 mt-0.5">
                    {classificationResult.action_taken}
                  </div>
                </div>
              </div>
            </div>

            {/* Classification Logs Stream (JSONL table) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Stream: classification_logs.jsonl
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {classificationLogs.length} Records Logged
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">TIMESTAMP</th>
                      <th className="py-2 px-3">CLASSIFICATION</th>
                      <th className="py-2 px-3">CONFIDENCE</th>
                      <th className="py-2 px-3">EXTRACTED ENTITIES</th>
                      <th className="py-2 px-3">MESSAGE EXCERPT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                    {classificationLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                          {log.timestamp.slice(11, 19)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.classification === 'Urgent'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {log.classification}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">
                          {(log.confidence_score * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                          {log.extracted_information?.emails?.join(', ') ||
                            log.extracted_information?.order_ids?.join(', ') ||
                            'Standard'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">
                          {log.raw_text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Rule-Based Order Monitor Bot */}
        {activeTab === 'order_bot' && (
          <div className="space-y-6">
            {/* Bot Controls & Status Header */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Order Monitor Bot Status: Active
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-amber-400 font-mono">
                    Next Check in {secondsUntilCheck}s
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Watches <code className="text-indigo-300">incoming_stream.txt</code>. When &quot;ORDER&quot; is found, extracts the next line and appends it to <code className="text-emerald-300">processed_orders.txt</code>. If not found, waits 5s.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleInjectOrder}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Inject New &quot;ORDER&quot;</span>
                </button>
                <button
                  onClick={handleInjectPing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                >
                  <span>Inject Non-Order Ping</span>
                </button>
              </div>
            </div>

            {/* Split Stream Watcher View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Pane: incoming_stream.txt */}
              <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Watch Target: incoming_stream.txt</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Editable in real-time</span>
                </div>

                <textarea
                  value={streamContent}
                  onChange={(e) => setStreamContent(e.target.value)}
                  rows={12}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
                <div className="text-[11px] text-slate-500">
                  Type <code className="text-amber-300">ORDER</code> on one line and the order details on the next line.
                </div>
              </div>

              {/* Right Pane: processed_orders.txt & Terminal Logs */}
              <div className="lg:col-span-6 space-y-4">
                {/* Processed Orders Output */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Output File: processed_orders.txt</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {processedOrders.length} Orders Logged
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 max-h-48 overflow-y-auto space-y-1.5">
                    {processedOrders.length === 0 ? (
                      <span className="text-slate-600">Waiting for first order...</span>
                    ) : (
                      processedOrders.map((ord, i) => (
                        <div key={i} className="truncate">
                          {ord}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bot Terminal Output Console */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <span>Bot Terminal Console (5s Loop)</span>
                    </span>
                    <button
                      onClick={() => setBotLogs([])}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-44 overflow-y-auto space-y-1">
                    {botLogs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.includes('DETECTED')
                            ? 'text-emerald-400 font-semibold'
                            : log.includes('Waiting 5s')
                            ? 'text-slate-500'
                            : 'text-indigo-300'
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Code & Step-by-Step Instructions */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            {/* Quick Terminal Guide */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>How to Set Up & Run in Terminal</span>
              </h2>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">1. Install Dependencies:</div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-emerald-400 border border-slate-800">
                    pip install scikit-learn joblib numpy
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">2. Train the Scikit-Learn Model:</div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-emerald-400 border border-slate-800">
                    python3 python_automation/train_classifier.py
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    Reads <code className="text-slate-300">training_data.csv</code>, splits 80/20 train-test, trains TF-IDF + Naive Bayes, and exports <code className="text-slate-300">urgency_model.joblib</code>.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">3. Run the Urgency Classifier Bot:</div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-emerald-400 border border-slate-800">
                    python3 python_automation/urgency_classifier_bot.py
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    Processes incoming text entries, extracts contact emails & order IDs, predicts Urgency, and appends to <code className="text-slate-300">classification_logs.jsonl</code>.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">4. Run the Rule-Based Order Monitoring Bot:</div>
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-emerald-400 border border-slate-800">
                    python3 python_automation/order_monitor_bot.py
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    Continuously monitors <code className="text-slate-300">incoming_stream.txt</code>. When &apos;ORDER&apos; is found, extracts the next line to <code className="text-slate-300">processed_orders.txt</code>. If not found, waits 5s.
                  </p>
                </div>
              </div>
            </div>

            {/* Script Viewer Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Script 1 */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">train_classifier.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.train_classifier, 'train')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'train' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'train' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.train_classifier}
                </pre>
              </div>

              {/* Script 2 */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">urgency_classifier_bot.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.urgency_bot, 'bot')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'bot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'bot' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.urgency_bot}
                </pre>
              </div>

              {/* Script 3 */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">order_monitor_bot.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.order_monitor, 'order')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'order' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'order' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.order_monitor}
                </pre>
              </div>

              {/* Script 4: File Organizer */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">file_organizer.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.file_organizer, 'file_org')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'file_org' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'file_org' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.file_organizer}
                </pre>
              </div>

              {/* Script 5: Keyword Chatbot */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">keyword_chatbot.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.keyword_chatbot, 'kw_bot')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'kw_bot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'kw_bot' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.keyword_chatbot}
                </pre>
              </div>

              {/* Script 6: Weather Fetcher */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white">weather_fetcher.py</div>
                  <button
                    onClick={() => handleCopy(codeSnippets.weather_fetcher, 'weather')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'weather' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'weather' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.weather_fetcher}
                </pre>
              </div>

              {/* Script 7: El Camiones Sales Engine & Auto-Dialer */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>elcamiones_sales_engine.py (Dialer 708-232-6581, Emails: billonesromasel18@gmail.com / Romasel.b@elcamiones.com, FB Router)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(codeSnippets.elcamiones_sales, 'elcamiones')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedCode === 'elcamiones' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'elcamiones' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                  {codeSnippets.elcamiones_sales}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
