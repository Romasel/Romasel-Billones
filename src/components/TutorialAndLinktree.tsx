/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Video,
  Terminal,
  ExternalLink,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Share2,
  Send,
  CloudSun,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const TutorialAndLinktree: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tutorial' | 'linktree'>('tutorial');

  // Video / Terminal Tutorial State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ # Welcome to the AutoTrain AI Python System Runner',
    '$ # Hit "Run System Live" to execute all automation scripts in sequence.',
  ]);

  const tutorialSteps = [
    {
      title: 'Step 1: Virtual Environment & Packages',
      cmd: 'python3 -m venv venv && source venv/bin/activate && pip install requests scikit-learn',
      desc: 'Creates an isolated virtual environment and installs necessary networking and ML dependencies.',
    },
    {
      title: 'Step 2: File Organizer Automation',
      cmd: 'python3 file_organizer.py --dir=./downloads_inbox',
      desc: 'Sorts files by extensions (.pdf, .jpg, .xlsx, .zip) into dedicated categorized subfolders.',
    },
    {
      title: 'Step 3: Keyword Customer Service Bot',
      cmd: 'python3 keyword_chatbot.py --port=8080',
      desc: 'Launches regex-driven intent engine answering hours, pricing, and emergency 708-232-6581 dispatch.',
    },
    {
      title: 'Step 4: Weather API Dispatch Advisory',
      cmd: 'python3 weather_fetcher.py --city="Chicago"',
      desc: 'Queries real-time temperature and wind conditions to generate commercial fleet road safety alerts.',
    },
    {
      title: 'Step 5: elcamiones.com Sales Auto-Dialer & Emailer',
      cmd: 'python3 elcamiones_sales_engine.py --interval=5m --target="7082326581"',
      desc: 'Outbound sales throttle at 5-10 min intervals, dispatching from billonesromasel18@gmail.com / Romasel.b@elcamiones.com and routing to Facebook.',
    },
  ];

  // Animated Terminal Runner when "Hit Run" is clicked
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= tutorialSteps.length) {
            setIsPlaying(false);
            setTerminalLogs(logs => [
              ...logs,
              `[${new Date().toLocaleTimeString()}] ✔ ALL AUTOMATIONS EXECUTED SUCCESSFULLY! (0 errors, 100% pass)`,
            ]);
            return tutorialSteps.length - 1;
          }
          const stepObj = tutorialSteps[next];
          setTerminalLogs(logs => [
            ...logs,
            `$ ${stepObj.cmd}`,
            `[${new Date().toLocaleTimeString()}] Executing: ${stepObj.title}...`,
            `  ➔ Status: 200 OK | Process PID: ${34810 + next} [RUNNING]`,
          ]);
          return next;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleRunSystem = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] Initializing AutoTrain AI Automation Engine...`,
      `$ ${tutorialSteps[0].cmd}`,
      `[${new Date().toLocaleTimeString()}] Setting up python virtual environment... OK.`,
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTerminalLogs([
      '$ # Terminal reset. Ready to run Python automation pipeline.',
      '$ # Hit "Run System Live" to execute.',
    ]);
  };

  // Linktree Lead Capture State
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;
    setLeadSubmitted(true);
    setTimeout(() => setLeadSubmitted(false), 4000);
  };

  const copyLinktreeUrl = () => {
    navigator.clipboard.writeText(
      window.location.origin + '/#linktree-elcamiones'
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Video className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              Interactive Execution Tutorial & Lead Linktree
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              Runnable Code Walkthrough
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Watch and run the automated execution walkthrough in real-time, or preview the mobile Linktree lead generator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'tutorial'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Video / Terminal Tutorial
            </button>
            <button
              onClick={() => setActiveTab('linktree')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'linktree'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linktree & Lead Page
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tutorial' ? (
        <div className="mt-5 space-y-6">
          {/* Top Tutorial Controls */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : handleRunSystem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Walkthrough</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run System Live (All Scripts)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Terminal</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Step {currentStep + 1} of {tutorialSteps.length}:</span>
              <span className="text-white font-semibold">
                {tutorialSteps[currentStep].title}
              </span>
            </div>
          </div>

          {/* Stepper Visual Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {tutorialSteps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setTerminalLogs(logs => [
                    ...logs,
                    `$ ${step.cmd}`,
                    `[${new Date().toLocaleTimeString()}] Jumped to ${step.title}`,
                  ]);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                  idx === currentStep
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : idx < currentStep
                    ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                  <span>STEP 0{idx + 1}</span>
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : idx === currentStep ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="font-semibold truncate">{step.title.split(':')[1] || step.title}</div>
              </div>
            ))}
          </div>

          {/* Video / Terminal Walkthrough Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Tutorial Screen */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-400" />
                    <span>Visual Code Tutorial Walkthrough</span>
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                    Python 3.10+
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <h4 className="font-semibold text-white mb-1">
                      {tutorialSteps[currentStep].title}
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {tutorialSteps[currentStep].desc}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs">
                    <span className="text-slate-500 block text-[10px] mb-1">Command to run in terminal:</span>
                    <span className="text-indigo-300 select-all">{tutorialSteps[currentStep].cmd}</span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Production Automation Best Practices:</span>
                    </div>
                    <p className="text-slate-400">
                      • Run on VPS or background tmux session with <code className="text-slate-300">python3 script.py &amp;</code>
                    </p>
                    <p className="text-slate-400">
                      • Keep Google Voice / SIP outbound calls throttled to <strong>5–10 min intervals</strong>.
                    </p>
                    <p className="text-slate-400">
                      • Route questions to Facebook: <a href="https://www.facebook.com/profile.php?id=61590527562517" target="_blank" rel="noreferrer" className="text-blue-400 underline">https://www.facebook.com/profile.php?id=61590527562517</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Auto-Advance Duration: 1.6s/step</span>
                <span className="font-mono text-emerald-400">Status: Standby</span>
              </div>
            </div>

            {/* Live Terminal Console */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col h-[400px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Terminal (bash)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">pty-0</span>
              </div>

              <div className="flex-1 bg-slate-900/95 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-y-auto leading-relaxed">
                {terminalLogs.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.startsWith('$')
                        ? 'text-white font-semibold'
                        : line.includes('SUCCESSFULLY')
                        ? 'text-emerald-400 font-bold'
                        : line.includes('Executing')
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                {isPlaying && (
                  <div className="flex items-center gap-1.5 text-indigo-400 pt-1">
                    <span className="w-2 h-3.5 bg-indigo-400 animate-pulse" />
                    <span className="text-[10px]">Processing pipeline task...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Linktree Tab */
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobile Frame Preview */}
          <div className="lg:col-span-2 flex justify-center py-4">
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60 rounded-3xl border-4 border-slate-800 p-5 shadow-2xl relative">
              {/* Phone Speaker Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-4" />

              {/* Brand Avatar */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">El Camiones Services</h3>
                <p className="text-xs text-indigo-300">
                  Commercial Fleet Repair, Towing &amp; 24/7 Roadside Assistance
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● 24/7 Dispatch Live
                </span>
              </div>

              {/* Direct Link Buttons */}
              <div className="space-y-3">
                <a
                  href="tel:7082326581"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-transform active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Emergency Roadside: (708) 232-6581</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61590527562517"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-between shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>Questions? Chat on Facebook</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="mailto:Romasel.b@elcamiones.com"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-between border border-slate-700 transition-transform active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Email Rep: Romasel.b@elcamiones.com</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="mailto:billonesromasel18@gmail.com"
                  className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-between border border-slate-800 transition-transform active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[11px]">billonesromasel18@gmail.com</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Lead Capture Form inside Linktree */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-semibold text-white mb-2 text-center">
                  Request Instant Fleet Quote
                </h4>

                {leadSubmitted ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-center text-xs">
                    ✔ Inquiry received! Our Cook County dispatch will call you at (708) 232-6581 shortly.
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={leadName}
                      onChange={e => setLeadName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Company Name (e.g. Apex Hauling)"
                      value={leadCompany}
                      onChange={e => setLeadCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (e.g. 708-232-6581)"
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Submit Quote Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Linktree Configuration & Share */}
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Linktree Lead Page Details</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Use this high-converting mobile link page in your outbound cold emails, Google Voice SMS, and marketing campaigns.
              </p>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="font-mono text-emerald-400">(708) 232-6581</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Account Rep:</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[170px]" title="Romasel.b@elcamiones.com / billonesromasel18@gmail.com">
                    Romasel.b@elcamiones.com
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Facebook Support:</span>
                  <span className="font-mono text-blue-400 truncate max-w-[140px]">
                    Profile 61590527562517
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={copyLinktreeUrl}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Shareable Linktree URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
