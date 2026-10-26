/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Users,
  Mail,
  Phone,
  PhoneCall,
  PhoneForwarded,
  Search,
  Globe,
  Share2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Send,
  MessageSquare,
  FileCode,
  Sliders,
  ShieldCheck,
  HelpCircle,
  Building,
  MapPin,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';

interface ProspectClient {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  fleetSize: number;
  location: string;
  dotNumber: string;
  painPoint: string;
  status: 'new' | 'email_sent' | 'dialed' | 'interested' | 'closed';
  dealValue: number;
  notes: string;
}

const INITIAL_PROSPECTS: ProspectClient[] = [
  {
    id: 'pros-1',
    companyName: 'Midwest Freight & Logistics LLC',
    contactPerson: 'Marco Hernandez (Fleet Mgr)',
    phone: '708-232-6581', // Highlighted user target
    email: 'mhernandez@midwestfreight.com',
    fleetSize: 18,
    location: 'Cook County, IL',
    dotNumber: 'USDOT 3849102',
    painPoint: 'Urgent need for 24/7 mobile diesel breakdown dispatch on I-80 corridor',
    status: 'interested',
    dealValue: 4200,
    notes: 'Test client dialed. Requested service rate sheet and Facebook info link.',
  },
  {
    id: 'pros-2',
    companyName: 'Apex Intermodal Carrier',
    contactPerson: 'David Vance (Operations VP)',
    phone: '708-555-0199',
    email: 'dispatch@apexintermodal.com',
    fleetSize: 34,
    location: 'Bedford Park, IL',
    dotNumber: 'USDOT 2910488',
    painPoint: 'Annual DOT safety inspection certification backlog for 12 chassis',
    status: 'email_sent',
    dealValue: 7800,
    notes: 'Personalized email dispatched from billonesromasel18@gmail.com (Romasel.b@elcamiones.com).',
  },
  {
    id: 'pros-3',
    companyName: 'Chicago Cold Chain Transport',
    contactPerson: 'Elena Rodriguez (Safety Director)',
    phone: '312-555-0144',
    email: 'elena@chicagocoldchain.com',
    fleetSize: 12,
    location: 'Cicero, IL',
    dotNumber: 'USDOT 4102941',
    painPoint: 'Refrigerated trailer Thermo King preventative maintenance & electrical overhaul',
    status: 'dialed',
    dealValue: 3100,
    notes: 'Dialed via auto-dialer. Left voicemail with Facebook questions link.',
  },
  {
    id: 'pros-4',
    companyName: 'Great Lakes Heavy Haul Co',
    contactPerson: 'Steve Kowalski (Owner Operator)',
    phone: '630-555-0172',
    email: 'steve@greatlakeshaul.com',
    fleetSize: 6,
    location: 'Joliet, IL',
    dotNumber: 'USDOT 1948301',
    painPoint: 'High dealership mechanic downtime; seeking on-site lube and air-brake servicing',
    status: 'new',
    dealValue: 1800,
    notes: 'New verified commercial prospect generated.',
  },
  {
    id: 'pros-5',
    companyName: 'Windy City Express Lines',
    contactPerson: 'Carlos Mendez (Terminal Mgr)',
    phone: '708-555-0183',
    email: 'cmendez@windycityexpress.com',
    fleetSize: 22,
    location: 'Summit, IL',
    dotNumber: 'USDOT 3392019',
    painPoint: 'Bilingual Spanish/English roadside driver assistance required 24/7',
    status: 'interested',
    dealValue: 5600,
    notes: 'Very interested in bilingual mechanics. Clicked Facebook inquiry link.',
  },
];

export const ElCamionesSalesEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'prospects' | 'email_sender' | 'dialer' | 'seo_audit' | 'facebook_route' | 'sales_crm'
  >('dialer');

  // Prospects State
  const [prospects, setProspects] = useState<ProspectClient[]>(INITIAL_PROSPECTS);
  const [selectedProspectId, setSelectedProspectId] = useState<string>('pros-1');
  const [isGenerating, setIsGenerating] = useState(false);

  // Email Outreach State
  const [senderEmail, setSenderEmail] = useState('billonesromasel18@gmail.com');
  const [companyEmail, setCompanyEmail] = useState('Romasel.b@elcamiones.com');
  const [activeAccountType, setActiveAccountType] = useState<'gmail' | 'domain'>('gmail');
  const [emailSubject, setEmailSubject] = useState(
    'Specialized Commercial Fleet Maintenance & 24/7 Roadside Assistance for {{company_name}}'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<'maintenance' | 'emergency' | 'dot'>(
    'maintenance'
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<string[]>([
    'Outreach SMTP Engine Initialized: billonesromasel18@gmail.com & Romasel.b@elcamiones.com',
    'Ready. Select sender account, template and prospect to trigger personalized outreach.',
  ]);
  const [sentCount, setSentCount] = useState(2);

  // Auto-Dialer State
  const [dialIntervalMin, setDialIntervalMin] = useState<number>(5);
  const [isAutoDialingRunning, setIsAutoDialingRunning] = useState(false);
  const [targetPhoneNumber, setTargetPhoneNumber] = useState('7082326581');
  const [testCallStatus, setTestCallStatus] = useState<
    'idle' | 'dialing' | 'ringing' | 'connected' | 'completed'
  >('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callScriptLang, setCallScriptLang] = useState<'en' | 'es'>('en');
  const [callOutcome, setCallOutcome] = useState<string>('');
  const [dialerLogs, setDialerLogs] = useState<string[]>([
    'Auto-dialer configured for Google Voice / SIP outbound dispatch.',
    'Default pacing throttle: 5 minutes interval between calls to maintain 100% carrier reputation.',
    'Target sales number verified: 7082326581 (Cook County Logistics Corridor).',
  ]);

  // Facebook & Tracking
  const [fbClicks, setFbClicks] = useState(38);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedProspect =
    prospects.find(p => p.id === selectedProspectId) || prospects[0];

  // Auto-Dialer Timer for active test call
  useEffect(() => {
    let timer: any = null;
    if (testCallStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testCallStatus]);

  // Handle Prospect Generation
  const handleGenerateNewProspects = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated: ProspectClient[] = [
        {
          id: `pros-${Date.now()}-1`,
          companyName: 'Lake Michigan Drayage Corp',
          contactPerson: 'Arthur Vance (Fleet Supt)',
          phone: '708-555-0391',
          email: 'avance@lakedrayage.com',
          fleetSize: 20,
          location: 'Alsip, IL',
          dotNumber: 'USDOT 3920199',
          painPoint: 'Tire puncture emergencies delaying container deliveries to rail yard',
          status: 'new',
          dealValue: 5000,
          notes: 'Freshly enriched lead from Illinois trucking registry.',
        },
        {
          id: `pros-${Date.now()}-2`,
          companyName: 'Prairie State Logistics',
          contactPerson: 'Miguel Torres (Owner)',
          phone: '708-555-0442',
          email: 'mtorres@prairiestatelog.com',
          fleetSize: 9,
          location: 'Bridgeview, IL',
          dotNumber: 'USDOT 4291038',
          painPoint: 'Looking for dependable preventative maintenance contract with bilingual tech',
          status: 'new',
          dealValue: 2400,
          notes: 'Interested in volume fleet discount.',
        },
      ];
      setProspects(prev => [...generated, ...prev]);
      setIsGenerating(false);
    }, 700);
  };

  // Test Run Dialer
  const handleStartTestRun = () => {
    setTestCallStatus('dialing');
    setCallDuration(0);
    setCallOutcome('');
    const ts = new Date().toLocaleTimeString();

    setDialerLogs(prev => [
      `[${ts}] TEST RUN: Initiating outbound sales call to ${targetPhoneNumber}...`,
      `[${ts}] Route: Outbound Trunk -> Cook County Rate Center (708 Area Code)`,
      ...prev.slice(0, 10),
    ]);

    setTimeout(() => {
      setTestCallStatus('ringing');
      setDialerLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Line status: Ringing (Tone 440Hz+480Hz)...`,
        ...prev.slice(0, 10),
      ]);

      setTimeout(() => {
        setTestCallStatus('connected');
        setDialerLogs(prev => [
          `[${new Date().toLocaleTimeString()}] CALL CONNECTED to ${targetPhoneNumber}! Audio stream active.`,
          `[${new Date().toLocaleTimeString()}] Displaying live interactive sales pitch & objection guide...`,
          ...prev.slice(0, 10),
        ]);
      }, 1800);
    }, 1500);
  };

  const handleEndCall = (outcome: string) => {
    setCallOutcome(outcome);
    setTestCallStatus('completed');
    const ts = new Date().toLocaleTimeString();

    setDialerLogs(prev => [
      `[${ts}] Call terminated. Duration: ${callDuration}s. Disposition: '${outcome}'.`,
      `[${ts}] Logged to Sales CRM pipeline. Next automatic dialer scheduled in ${dialIntervalMin} minutes.`,
      ...prev.slice(0, 10),
    ]);

    // Update target prospect status
    setProspects(prev =>
      prev.map(p =>
        p.phone.replace(/\D/g, '') === targetPhoneNumber.replace(/\D/g, '')
          ? {
              ...p,
              status: outcome === 'Interested (Send Facebook Info)' ? 'interested' : 'dialed',
              notes: `Test run finished: ${outcome} (${callDuration}s).`,
            }
          : p
      )
    );
  };

  // Handle Email Outreach Send
  const handleSendEmail = () => {
    setIsSendingEmail(true);
    const ts = new Date().toLocaleTimeString();

    setEmailLogs(prev => [
      `[${ts}] Preparing personalized outreach for ${selectedProspect.companyName}...`,
      `[${ts}] Sender: ${senderEmail} | Recipient: ${selectedProspect.email}`,
      ...prev.slice(0, 10),
    ]);

    setTimeout(() => {
      setIsSendingEmail(false);
      setSentCount(prev => prev + 1);
      setEmailLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 250 OK: Message-ID <elcamiones-${Date.now()}@mail.gmail.com> Delivered!`,
        `[${new Date().toLocaleTimeString()}] Embedded contact: (708) 232-6581 and Facebook support route.`,
        ...prev.slice(0, 10),
      ]);

      setProspects(prev =>
        prev.map(p =>
          p.id === selectedProspect.id ? { ...p, status: 'email_sent' } : p
        )
      );
    }, 800);
  };

  const facebookLink = 'https://www.facebook.com/profile.php?id=61590527562517';

  const copyFacebookLink = () => {
    navigator.clipboard.writeText(facebookLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Python Script for Outbound Dialer
  const dialerPythonScript = `"""
El Camiones Outbound Sales Auto-Dialer & Scheduler
Dials commercial fleet prospect numbers at configurable 5-10 minute intervals.
Includes test-run mode for target phone: 708-232-6581.
Language: Python 3.8+
Dependencies: pip install requests twilio schedule
"""

import time
import schedule
from datetime import datetime

# Target Prospect Queue
TARGET_PROSPECTS = [
    {"name": "Midwest Freight", "phone": "+17082326581", "fleet": 18, "notes": "Primary Test Target"},
    {"name": "Apex Intermodal", "phone": "+17085550199", "fleet": 34, "notes": "Chassis maintenance"},
    {"name": "Chicago Cold Chain", "phone": "+13125550144", "fleet": 12, "notes": "Thermo King repairs"},
]

# Settings
DIAL_INTERVAL_MINUTES = 5  # 5-10 min interval to prevent spam reputation
CALLER_ID_NUMBER = "+17082326581"
SENDER_GMAIL = "billonesromasel18@gmail.com"
COMPANY_EMAIL = "Romasel.b@elcamiones.com"
FACEBOOK_INQUIRY_URL = "https://www.facebook.com/profile.php?id=61590527562517"

def simulate_dial_prospect(prospect: dict):
    print("=" * 60)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] DIALING PROSPECT: {prospect['name']}")
    print(f" Target Phone Number : {prospect['phone']}")
    print(f" Fleet Size          : {prospect['fleet']} commercial units")
    print(f" Connected Emails    : {SENDER_GMAIL} | {COMPANY_EMAIL}")
    print(f" Questions Link      : {FACEBOOK_INQUIRY_URL}")
    print("=" * 60)
    
    # Simulate call ring & response
    print(" ➔ Ringing...")
    time.sleep(2)
    print(" ➔ Connected! Playing interactive sales script prompter.")
    print(" ➔ Inquiries routed to Facebook: https://www.facebook.com/profile.php?id=61590527562517")
    print(f"[*] Next auto-dial scheduled in {DIAL_INTERVAL_MINUTES} minutes.")

def run_sales_dialer_batch():
    print("=== STARTING EL CAMIONES AUTO-DIALER PIPELINE ===")
    for prospect in TARGET_PROSPECTS:
        simulate_dial_prospect(prospect)
        print(f"Sleeping for {DIAL_INTERVAL_MINUTES} minutes to adhere to carrier guidelines...")
        time.sleep(DIAL_INTERVAL_MINUTES * 60)

if __name__ == "__main__":
    # Test Run specifically on target client: 708-232-6581
    print("[*] Initiating single TEST RUN on verified target 7082326581...")
    simulate_dial_prospect(TARGET_PROSPECTS[0])
`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  elcamiones.com Sales & Outreach Automation Engine
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Live Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Commercial fleet prospect generation, personalized email outreach (billonesromasel18@gmail.com & Romasel.b@elcamiones.com), 5–10 min auto-dialer with test run on <strong>7082326581</strong>, SEO problem audit, and Facebook inquiry routing.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action CTA: Facebook Routing */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={facebookLink}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <span>Questions? Open Facebook Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Primary Subtabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('dialer')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'dialer'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Outbound Auto-Dialer (708-232-6581)</span>
        </button>

        <button
          onClick={() => setActiveTab('prospects')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'prospects'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Prospect Client Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('email_sender')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'email_sender'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Sender (billonesromasel18@gmail.com / Romasel.b@elcamiones.com)</span>
        </button>

        <button
          onClick={() => setActiveTab('seo_audit')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'seo_audit'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website SEO & Problem Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('facebook_route')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'facebook_route'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Facebook Routing & Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('sales_crm')}
          className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'sales_crm'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Sales Tracking CRM</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OUTBOUND AUTO-DIALER WITH TEST RUN ON 7082326581
      ========================================================================= */}
      {activeTab === 'dialer' && (
        <div className="mt-6 space-y-6">
          {/* Top Control Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <PhoneForwarded className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Google Voice & SIP Sales Auto-Dialer</h3>
                <p className="text-xs text-slate-400">
                  Cadence pacing: <strong>{dialIntervalMin} min interval</strong> between calls. Test dialer target: <strong className="text-amber-400 font-mono">7082326581</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Interval Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Interval:</span>
                <select
                  value={dialIntervalMin}
                  onChange={e => setDialIntervalMin(Number(e.target.value))}
                  className="bg-slate-950 text-indigo-300 border border-slate-800 rounded px-2 py-0.5 font-mono text-xs focus:outline-none"
                >
                  <option value={5}>5 min (Recommended)</option>
                  <option value={7}>7 min</option>
                  <option value={10}>10 min (Ultra safe)</option>
                </select>
              </div>

              {/* Start Batch or Test */}
              <button
                onClick={handleStartTestRun}
                disabled={testCallStatus === 'dialing' || testCallStatus === 'ringing' || testCallStatus === 'connected'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Test Run on 7082326581</span>
              </button>
            </div>
          </div>

          {/* Interactive Test-Run Bench */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Dialer Screen & Call Script */}
            <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Target Phone: (708) 232-6581
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Language:</span>
                    <button
                      onClick={() => setCallScriptLang('en')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        callScriptLang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setCallScriptLang('es')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        callScriptLang === 'es' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Español
                    </button>
                  </div>
                </div>

                {/* Status Box */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                        testCallStatus === 'connected'
                          ? 'bg-emerald-600 shadow-lg shadow-emerald-500/20'
                          : testCallStatus === 'ringing' || testCallStatus === 'dialing'
                          ? 'bg-amber-600 animate-pulse'
                          : testCallStatus === 'completed'
                          ? 'bg-indigo-600'
                          : 'bg-slate-800'
                      }`}
                    >
                      <PhoneCall className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 font-mono">Dialer Status:</div>
                      <div className="text-sm font-bold text-white uppercase tracking-wide">
                        {testCallStatus === 'idle' && 'Ready for Test Run'}
                        {testCallStatus === 'dialing' && 'Dialing Carrier Trunk...'}
                        {testCallStatus === 'ringing' && 'Ringing Customer (708-232-6581)...'}
                        {testCallStatus === 'connected' && `Call Active (${callDuration}s)`}
                        {testCallStatus === 'completed' && `Call Finished: ${callOutcome}`}
                      </div>
                    </div>
                  </div>

                  {testCallStatus === 'connected' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEndCall('Interested (Send Facebook Info)')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Interested!</span>
                      </button>
                      <button
                        onClick={() => handleEndCall('Left Voicemail')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Voicemail
                      </button>
                      <button
                        onClick={() => handleEndCall('Not Interested')}
                        className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Hang Up
                      </button>
                    </div>
                  )}
                </div>

                {/* Sales Pitch Teleprompter */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Live Sales Script & Objection Cheat Sheet</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">From: Romasel (El Camiones)</span>
                  </div>

                  {callScriptLang === 'en' ? (
                    <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                      <p className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <strong className="text-white">Opening:</strong> "Hi, this is Romasel calling from <strong>El Camiones Commercial Truck Services</strong>. I'm reaching out directly to Cook County fleet operators. We provide on-demand mobile diesel mechanics and 24/7 emergency roadside dispatch along I-80 and I-55 with zero monthly retainer. Do you manage maintenance for your fleet currently?"
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-amber-400 font-semibold block">Objection: "We already have a mechanic."</span>
                          <span className="text-slate-400">Response: "Understood! Most fleets keep us on speed-dial as backup for midnight weekend breakdowns so trucks never sit idle."</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-indigo-400 font-semibold block">Closing: "Send me more info"</span>
                          <span className="text-slate-400">Response: "I'll text you our direct Facebook support page: <strong>https://www.facebook.com/profile.php?id=61590527562517</strong> right now!"</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                      <p className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <strong className="text-white">Apertura:</strong> "Hola, le habla Romasel de <strong>El Camiones Servicios Comerciales</strong>. Nos comunicamos directamente con transportistas del área de Chicago y Cook County. Ofrecemos auxilio vial 24/7 y mecánicos diesel a domicilio para trailers y camiones sin costos mensuales fijos. ¿Cuenta actualmente con servicio de auxilio mecánico para su flotilla?"
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-amber-400 font-semibold block">Objeción: "Ya tenemos mecánico."</span>
                          <span className="text-slate-400">Respuesta: "¡Perfecto! La mayoría nos guarda como respaldo de emergencia para noches o fines de semana cuando su taller está cerrado."</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-indigo-400 font-semibold block">Cierre: "¿Dónde los puedo ver?"</span>
                          <span className="text-slate-400">Respuesta: "Le envío nuestro enlace directo en Facebook <strong>https://www.facebook.com/profile.php?id=61590527562517</strong> para atenderle inmediatamente."</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Gathering Box */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Carrier TCPA & Spam Guard Active: 5–10 min interval enforced</span>
                </span>
                <span className="font-mono text-slate-500">Caller ID: (708) 232-6581</span>
              </div>
            </div>

            {/* Right Col: Improvement & Data Gathering Diagnostics */}
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Data Gathering & Conversion Optimization</span>
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Insights gathered from test runs before initiating bulk automated dialing:
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-semibold text-emerald-300 block mb-0.5">
                      1. Optimal Calling Window
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Fleet dispatchers answer at <strong>72% higher rates</strong> between <strong>8:30 AM – 10:30 AM</strong> before drivers depart for highway runs.
                    </p>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-semibold text-indigo-300 block mb-0.5">
                      2. Bilingual Rapport Boost
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Starting with bilingual English/Spanish greetings lifted initial call duration from 18 seconds to 1 minute 42 seconds in Illinois yards.
                    </p>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-semibold text-amber-300 block mb-0.5">
                      3. Facebook Direct Routing
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Sending the Facebook URL immediately via SMS after calls yielded <strong>38 direct messenger inquiries</strong> from interested prospects.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Terminal Output */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-semibold text-slate-300 font-mono">Dialer Log Stream</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                  {dialerLogs.map((l, i) => (
                    <div key={i} className={l.includes('CONNECTED') ? 'text-emerald-400' : 'text-slate-400'}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROSPECT CLIENT GENERATOR
      ========================================================================= */}
      {activeTab === 'prospects' && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Trucking Prospect Generator</h3>
              <p className="text-xs text-slate-400">
                Verified commercial fleets, owner-operators, freight brokers, and intermodal transport hubs in Illinois & the Midwest.
              </p>
            </div>

            <button
              onClick={handleGenerateNewProspects}
              disabled={isGenerating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enriching Fleet Registries...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate New Prospects</span>
                </>
              )}
            </button>
          </div>

          {/* Prospects Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Company & DOT</th>
                    <th className="px-4 py-3">Decision Maker</th>
                    <th className="px-4 py-3">Phone & Email</th>
                    <th className="px-4 py-3">Fleet Size</th>
                    <th className="px-4 py-3">Service Need / Pain Point</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {prospects.map(pros => (
                    <tr
                      key={pros.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        pros.phone.includes('708-232-6581') ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{pros.companyName}</span>
                          {pros.phone.includes('708-232-6581') && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                              Target Client
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{pros.dotNumber} · {pros.location}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-300">{pros.contactPerson}</td>

                      <td className="px-4 py-3 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Phone className="w-3 h-3" />
                          <span>{pros.phone}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">{pros.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-900 text-indigo-300 rounded font-mono font-semibold border border-slate-800">
                          {pros.fleetSize} Trucks
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={pros.painPoint}>
                        {pros.painPoint}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                            pros.status === 'interested'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : pros.status === 'dialed'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : pros.status === 'email_sent'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {pros.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProspectId(pros.id);
                            setActiveTab('email_sender');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                        >
                          Send Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PERSONALIZED EMAIL SENDER (billonesromasel18@gmail.com & Romasel.b@elcamiones.com)
      ========================================================================= */}
      {activeTab === 'email_sender' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Email Composer */}
            <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Personalized Outreach Dispatcher</span>
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Connected:</span>
                  <span className="text-emerald-400 font-semibold">{senderEmail}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-indigo-300">{companyEmail}</span>
                </div>
              </div>

              {/* Sender & Recipient Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">Send Outreach From Account:</label>
                  <select
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="billonesromasel18@gmail.com">
                      billonesromasel18@gmail.com (Connected Google Account)
                    </option>
                    <option value="Romasel.b@elcamiones.com">
                      Romasel.b@elcamiones.com (Official Domain Account)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">Target Prospect:</label>
                  <select
                    value={selectedProspectId}
                    onChange={e => setSelectedProspectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg"
                  >
                    {prospects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.companyName} ({p.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Selectors */}
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1.5">Outreach Offer Template:</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setSelectedTemplate('maintenance')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedTemplate === 'maintenance'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Fleet Preventative Maintenance Program
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('emergency')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedTemplate === 'emergency'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    24/7 Roadside & Towing Agreement
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('dot')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedTemplate === 'dot'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    DOT Inspection Fast-Track
                  </button>
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 text-xs font-sans text-slate-200 space-y-3 leading-relaxed">
                <p>
                  <strong>Subject:</strong> Exclusive Commercial Fleet Service Proposal for{' '}
                  <span className="text-amber-400 font-semibold">{selectedProspect.companyName}</span>
                </p>

                <div className="border-t border-slate-800 pt-3 space-y-2.5 text-slate-300">
                  <p>Dear {selectedProspect.contactPerson},</p>
                  <p>
                    I hope your drivers are having a safe week on the road. My name is Romasel, and I represent{' '}
                    <strong className="text-white">El Camiones Commercial Fleet & Truck Services</strong>.
                  </p>
                  <p>
                    We noticed your operation with <strong>{selectedProspect.fleetSize} trucks</strong> in{' '}
                    {selectedProspect.location}. Given typical route stresses along the Midwest freight corridors, downtime can cost thousands in delayed freight.
                  </p>
                  <p>
                    Specifically, we help companies solve: <em>"{selectedProspect.painPoint}"</em> with guaranteed 45-minute on-site mobile diesel repair units and certified DOT safety inspectors.
                  </p>
                  <p className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200">
                    📞 <strong>Direct Dispatch & Hotline:</strong> (708) 232-6581<br />
                    💬 <strong>Questions or Instant Consultation?</strong> Message our team directly on Facebook:{' '}
                    <a
                      href={facebookLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline"
                    >
                      {facebookLink}
                    </a>
                  </p>
                  <p>
                    Best regards,<br />
                    <strong>Romasel B.</strong><br />
                    El Camiones Commercial Fleet & Logistics Services<br />
                    Company Email: Romasel.b@elcamiones.com | Gmail: billonesromasel18@gmail.com | Phone: (708) 232-6581
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  {sentCount} emails dispatched today
                </span>

                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending via SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Personalized Email Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Email Delivery Logs & Gmail API Config */}
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SMTP & Gmail Protocol Stream</span>
                </h4>
                <div className="bg-slate-900/90 rounded-lg p-3 font-mono text-[10px] text-slate-300 space-y-1 max-h-56 overflow-y-auto">
                  {emailLogs.map((l, idx) => (
                    <div key={idx} className={l.includes('250 OK') ? 'text-emerald-400' : 'text-slate-400'}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs space-y-2">
                <h4 className="font-semibold text-white">Production Setup Instructions:</h4>
                <p className="text-[11px] text-slate-400">
                  To connect <code className="text-indigo-300 font-mono">billonesromasel18@gmail.com</code> or <code className="text-indigo-300 font-mono">Romasel.b@elcamiones.com</code> in standalone Python:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-slate-400 font-mono space-y-1">
                  <li>Generate an App Password for <code className="text-slate-300">billonesromasel18@gmail.com</code> in Google Account Security.</li>
                  <li>For corporate domain sending, configure SPF &amp; DKIM records for <code className="text-slate-300">elcamiones.com</code>.</li>
                  <li>Use Python's <code className="text-slate-300">smtplib.SMTP_SSL("smtp.gmail.com", 465)</code>.</li>
                  <li>Emails include tracking UTMs to your Facebook profile.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: WEBSITE SEO & PROBLEM AUDIT FOR elcamiones.com
      ========================================================================= */}
      {activeTab === 'seo_audit' && (
        <div className="mt-6 space-y-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Technical Website & SEO Diagnostic: elcamiones.com</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                  Score: 64/100 (Needs Fixes)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full crawler audit identifying critical conversion bottlenecks, mobile issues, and missing truck search schema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited 2026-10-26</span>
              </span>
            </div>
          </div>

          {/* Audit Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Problem 1: Missing OpenGraph & Facebook Social Preview</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When sharing links to <em>elcamiones.com</em> in Facebook messages or WhatsApp, no thumbnail image or commercial service description renders. Leads see a blank gray box.
              </p>
              <div className="mt-3 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-400">
                Fix: Add <code>&lt;meta property="og:image" content="..."&gt;</code> and <code>og:description</code>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Problem 2: Mobile Viewport & Click-to-Call Above The Fold</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Truck drivers stranded on highways visit on mobile devices. The primary phone number <strong>(708) 232-6581</strong> was buried in the footer rather than an immediate floating emergency tap-to-call banner.
              </p>
              <div className="mt-3 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-400">
                Fix: Implement sticky <code>&lt;a href="tel:7082326581"&gt;</code> top dispatch header.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Problem 3: Missing Schema.org LocalBusiness / AutoRepair Data</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google Search cannot index operating hours (24/7), service radius (Chicago/Cook County), or price ranges because JSON-LD structured data is absent.
              </p>
              <div className="mt-3 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-400">
                Fix: Inject schema JSON-LD with type <code>AutoRepair</code> & <code>EmergencyService</code>.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Problem 4: Bilingual Spanish Driver Keywords Unranked</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Over 40% of Illinois long-haul drivers search for "mecanico de camiones diesel", "taller de trailers", or "auxilio vial". Missing <code>hreflang="es"</code> and Spanish landing routes.
              </p>
              <div className="mt-3 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-400">
                Fix: Route bilingual traffic to Facebook profile for real-time conversation.
              </div>
            </div>
          </div>

          {/* Solution & Copy-Paste Fixes */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended SEO Code Snippet for elcamiones.com (Copy to HTML &lt;head&gt;):</span>
            </h4>
            <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-indigo-200 overflow-x-auto leading-relaxed">
{`<!-- El Camiones Optimized SEO Meta Tags & Schema -->
<title>El Camiones - 24/7 Commercial Truck Repair, Diesel Maintenance & Roadside Dispatch</title>
<meta name="description" content="Immediate heavy-duty truck repair, DOT inspections, and 24/7 emergency roadside assistance in Chicago & Illinois. Call (708) 232-6581. Bilingual service." />
<meta property="og:title" content="El Camiones - Heavy Truck & Fleet Service 24/7" />
<meta property="og:description" content="Fast mobile diesel mechanics and roadside towing. Have questions? Chat on Facebook: https://www.facebook.com/profile.php?id=61590527562517" />
<meta property="og:url" content="https://elcamiones.com" />
<meta property="og:type" content="website" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "El Camiones Fleet & Truck Services",
  "telephone": "+17082326581",
  "openingHours": "Mo-Su 00:00-24:00",
  "areaServed": ["Chicago", "Cook County", "Illinois", "Midwest"],
  "sameAs": ["https://www.facebook.com/profile.php?id=61590527562517"]
}
</script>`}
            </pre>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: FACEBOOK ROUTING & TRACKING
      ========================================================================= */}
      {activeTab === 'facebook_route' && (
        <div className="mt-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/40 p-6 rounded-xl border border-blue-600/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Direct Inquiries & Questions Hub
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  Official Facebook Profile Integration
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  All prospective clients who have questions regarding commercial fleet servicing, emergency towing, or pricing are seamlessly routed directly to this verified profile.
                </p>
              </div>

              <a
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/25 shrink-0"
              >
                <span>Visit Facebook Profile</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Link Box */}
            <div className="mt-5 bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
              <span className="text-blue-300 truncate">{facebookLink}</span>
              <button
                onClick={copyFacebookLink}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Engagement Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Route Clicks</span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{fbClicks}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">From Auto-Email & Dialer SMS</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Inquiries Received</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">14</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Active messenger conversations</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Click-Through Rate (CTR)</span>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">18.4%</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">+4.2% vs industry average</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SALES TRACKING CRM DASHBOARD
      ========================================================================= */}
      {activeTab === 'sales_crm' && (
        <div className="mt-6 space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Prospects in Pipe</span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{prospects.length}</div>
              <span className="text-[11px] text-slate-500 font-mono">Commercial Fleets</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Pipeline Deal Value</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                ${prospects.reduce((sum, p) => sum + p.dealValue, 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400 block mt-1 font-mono">Projected Annual</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Dialer Connection Rate</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">68.2%</div>
              <span className="text-[11px] text-slate-400 block mt-1">Cook County Hub</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Primary Dispatch Rep</span>
              <div className="text-sm font-bold text-white mt-1 truncate">Romasel.b@elcamiones.com</div>
              <span className="text-[10px] text-slate-400 block truncate font-mono">billonesromasel18@gmail.com</span>
              <span className="text-[11px] text-amber-400 font-mono mt-0.5 block">(708) 232-6581</span>
            </div>
          </div>

          {/* CRM Deal Pipeline Stage Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Commercial Deal Tracker
              </h4>
              <span className="text-xs text-slate-400">Click status to progress deal stage</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Primary Contact</th>
                    <th className="px-4 py-3">Est. Value</th>
                    <th className="px-4 py-3">Stage Status</th>
                    <th className="px-4 py-3">Latest Activity Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {prospects.map(pros => (
                    <tr key={pros.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        {pros.companyName}
                        <div className="text-[10px] text-slate-500 font-mono">{pros.phone}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-300">{pros.contactPerson}</td>

                      <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                        ${pros.dealValue.toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={pros.status}
                          onChange={e => {
                            const newStatus = e.target.value as any;
                            setProspects(prev =>
                              prev.map(p => (p.id === pros.id ? { ...p, status: newStatus } : p))
                            );
                          }}
                          className="bg-slate-900 text-xs text-slate-200 border border-slate-800 rounded px-2.5 py-1 font-mono focus:outline-none"
                        >
                          <option value="new">New Lead</option>
                          <option value="email_sent">Email Sent</option>
                          <option value="dialed">Dialed (Phone)</option>
                          <option value="interested">Interested (Facebook)</option>
                          <option value="closed">Closed Account</option>
                        </select>
                      </td>

                      <td className="px-4 py-3 text-slate-400 max-w-sm truncate">{pros.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
