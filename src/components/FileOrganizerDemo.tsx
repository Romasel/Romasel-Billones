/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Play,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Code2,
  Film,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface MockFile {
  name: string;
  ext: string;
  category: string;
  sizeKb: number;
}

const INITIAL_FILES: MockFile[] = [
  { name: 'quarterly_fleet_report.pdf', ext: 'pdf', category: 'Documents', sizeKb: 1240 },
  { name: 'freight_liner_engine_photo.jpg', ext: 'jpg', category: 'Images', sizeKb: 3450 },
  { name: 'driver_shift_notes.txt', ext: 'txt', category: 'Documents', sizeKb: 14 },
  { name: 'october_fuel_expenses.xlsx', ext: 'xlsx', category: 'Spreadsheets', sizeKb: 512 },
  { name: 'dashcam_incident_chicago.mp4', ext: 'mp4', category: 'Audio_Video', sizeKb: 18400 },
  { name: 'semi_truck_wiring_diagram.png', ext: 'png', category: 'Images', sizeKb: 2180 },
  { name: 'telematics_backup_2026.zip', ext: 'zip', category: 'Archives', sizeKb: 8900 },
  { name: 'dispatch_webhook_listener.py', ext: 'py', category: 'Code', sizeKb: 8 },
  { name: 'dot_inspection_checklist.pdf', ext: 'pdf', category: 'Documents', sizeKb: 890 },
  { name: 'mechanic_work_order.docx', ext: 'docx', category: 'Documents', sizeKb: 240 },
];

export const FileOrganizerDemo: React.FC = () => {
  const [files, setFiles] = useState<MockFile[]>(INITIAL_FILES);
  const [isOrganized, setIsOrganized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Directory initialized: /workspace/downloads_inbox/',
    'Ready. Click "Run File Organizer" to sort files by extension into subdirectories.',
  ]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'code'>('demo');
  const [newFileName, setNewFileName] = useState('');

  const handleRunOrganizer = () => {
    setIsProcessing(true);
    const newLogs = [
      `[${new Date().toLocaleTimeString()}] Scanning target directory: /workspace/downloads_inbox/`,
      `[${new Date().toLocaleTimeString()}] Found ${files.length} loose files across ${new Set(files.map(f => f.ext)).size} extensions.`,
    ];

    setTimeout(() => {
      const categories = Array.from(new Set(files.map(f => f.category)));
      categories.forEach(cat => {
        newLogs.push(`[${new Date().toLocaleTimeString()}] Verified / created destination folder: '${cat}/'`);
      });

      files.forEach(f => {
        newLogs.push(`[${new Date().toLocaleTimeString()}] Moved: '${f.name}' ➔ '${f.category}/${f.name}'`);
      });

      newLogs.push(
        `[${new Date().toLocaleTimeString()}] SUCCESS: Processed ${files.length} files into ${categories.length} organized subfolders.`
      );

      setLogs(newLogs);
      setIsOrganized(true);
      setIsProcessing(false);
    }, 600);
  };

  const handleReset = () => {
    setFiles(INITIAL_FILES);
    setIsOrganized(false);
    setLogs([
      'Directory reset to unorganized state: /workspace/downloads_inbox/',
      '10 unorganized test files loaded across Documents, Images, Spreadsheets, Archives, and Code.',
    ]);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const parts = name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'txt';

    let category = 'Documents';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) category = 'Images';
    else if (['xlsx', 'xls', 'csv'].includes(ext)) category = 'Spreadsheets';
    else if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) category = 'Archives';
    else if (['mp4', 'mkv', 'avi', 'mp3', 'wav'].includes(ext)) category = 'Audio_Video';
    else if (['py', 'js', 'ts', 'json', 'html', 'css', 'sh'].includes(ext)) category = 'Code';

    const newFile: MockFile = {
      name,
      ext,
      category,
      sizeKb: Math.floor(Math.random() * 2000) + 50,
    };

    setFiles(prev => [...prev, newFile]);
    setNewFileName('');
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Added new unorganized file: '${name}' (detected ext: .${ext})`,
      ...prev.slice(0, 8),
    ]);
    if (isOrganized) setIsOrganized(false);
  };

  const pythonScript = `"""
File Organizer Bot
Automates sorting files in any target directory by extension into organized subfolders.
Language: Python 3.8+
Standard Libraries: os, shutil, pathlib
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

# Configure your extension mapping
EXTENSION_CATEGORIES = {
    'Documents': ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.odt', '.md'],
    'Spreadsheets': ['.xlsx', '.xls', '.csv', '.tsv'],
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'],
    'Audio_Video': ['.mp4', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.flac'],
    'Archives': ['.zip', '.tar', '.gz', '.7z', '.rar'],
    'Code': ['.py', '.js', '.ts', '.html', '.css', '.json', '.sql', '.sh'],
}

def organize_directory(target_path: str) -> None:
    folder = Path(target_path).expanduser().resolve()
    if not folder.exists() or not folder.is_dir():
        print(f"[ERROR] Target directory '{folder}' does not exist.")
        return

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting file organizer in: {folder}")
    moved_count = 0

    for item in folder.iterdir():
        # Skip subfolders to prevent recursive moves
        if item.is_dir():
            continue

        ext = item.suffix.lower()
        destination_cat = 'Others'

        for cat, extensions in EXTENSION_CATEGORIES.items():
            if ext in extensions:
                destination_cat = cat
                break

        dest_dir = folder / destination_cat
        dest_dir.mkdir(exist_ok=True)

        destination_path = dest_dir / item.name
        
        # Avoid overwriting files with identical names
        if destination_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            destination_path = dest_dir / f"{item.stem}_{timestamp}{item.suffix}"

        shutil.move(str(item), str(destination_path))
        print(f" ➔ Moved '{item.name}' -> '{destination_cat}/'")
        moved_count += 1

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Done! Sorted {moved_count} files successfully.")

if __name__ == '__main__':
    # Set your downloads or unorganized directory path here:
    TARGET_DIR = "./downloads_inbox"
    organize_directory(TARGET_DIR)
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'Images':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'Spreadsheets':
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case 'Archives':
        return <FileArchive className="w-4 h-4 text-purple-400" />;
      case 'Audio_Video':
        return <Film className="w-4 h-4 text-rose-400" />;
      case 'Code':
        return <Code2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const categories = Array.from(new Set(files.map(f => f.category)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Folder className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Automated Directory File Organizer</h2>
            <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              Python OS & Shutil
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sorts files in any target directory by file extension (.txt, .jpg, .pdf, .xlsx, .zip) into structured subdirectories automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'demo' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Simulator
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'code' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python Script (.py)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'demo' ? (
        <div className="mt-5 space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Target:</span>
              <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-indigo-300 border border-slate-800">
                /workspace/downloads_inbox/
              </span>
              <span className="text-xs text-slate-500">({files.length} total files)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Files</span>
              </button>

              <button
                onClick={handleRunOrganizer}
                disabled={isProcessing || isOrganized}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  isOrganized
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sorting Files...</span>
                  </>
                ) : isOrganized ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Organized!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run File Organizer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add file inline form */}
          <form onSubmit={handleAddFile} className="flex gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="Add test file to directory (e.g., client_contract.pdf, truck_photo.png, fleet_data.csv)..."
              className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Test File</span>
            </button>
          </form>

          {/* Directory Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: File State */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span>
                    {isOrganized ? 'Organized Subfolders View' : 'Unorganized Inbox (Flat)'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {isOrganized ? `${categories.length} folders created` : 'All in root'}
                </span>
              </div>

              {!isOrganized ? (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800/60 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getFileIcon(file.category)}
                        <span className="text-slate-200 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500">
                          {file.sizeKb > 1024 ? `${(file.sizeKb / 1024).toFixed(1)} MB` : `${file.sizeKb} KB`}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          .{file.ext}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {categories.map((cat, idx) => {
                    const catFiles = files.filter(f => f.category === cat);
                    return (
                      <div key={idx} className="bg-slate-900/80 rounded-lg border border-slate-800/80 p-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{cat}/</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {catFiles.length} file{catFiles.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-1 pl-4 border-l border-slate-800">
                          {catFiles.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center justify-between text-[11px] font-mono py-1 text-slate-300"
                            >
                              <span className="truncate flex items-center gap-1.5">
                                <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                                {file.sizeKb > 1024 ? `${(file.sizeKb / 1024).toFixed(1)} MB` : `${file.sizeKb} KB`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Live Execution Console */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Python Runtime Console</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">stdout</span>
              </div>

              <div className="flex-1 bg-slate-900/90 rounded-lg border border-slate-800/90 p-3 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-72 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.includes('SUCCESS')
                        ? 'text-emerald-400 font-semibold'
                        : log.includes('Moved')
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Code Tab */
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">file_organizer.py (Ready to run locally)</span>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
            {pythonScript}
          </pre>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>How to execute this script on your machine:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
              <li>Save code into a file named <code className="text-indigo-300">file_organizer.py</code></li>
              <li>Change <code className="text-indigo-300">TARGET_DIR</code> to your downloads folder (e.g. <code className="text-slate-300">"~/Downloads"</code> or <code className="text-slate-300">"C:\\Users\\User\\Downloads"</code>)</li>
              <li>Run command: <code className="text-emerald-400">python3 file_organizer.py</code></li>
              <li>Optional cron automation (every hour): <code className="text-slate-300">0 * * * * python3 /path/to/file_organizer.py</code></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
