import React, { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [sensitivity, setSensitivity] = useState(50);
  const [modelUpdate, setModelUpdate] = useState('30s');
  const [smsNotify, setSmsNotify] = useState(true);
  const [voiceSpeech, setVoiceSpeech] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Settings Categories */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Preferences</h3>
          </div>

          <div className="space-y-5">
            {/* Theme Toggle option */}
            <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <strong className="text-xs text-slate-200 block">System Interface Theme</strong>
                <span className="text-[10px] text-slate-500">Toggle between medical Obsidian-Dark and Light themes.</span>
              </div>
              <button className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 font-bold px-4 py-2 rounded-lg transition-all">
                Toggle Light Mode
              </button>
            </div>

            {/* Notification settings */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Clinical Escalation Channels</h4>
              
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-xs text-slate-200 block">Emergency SMS Broadcast</strong>
                  <span className="text-[10px] text-slate-500">Alert attending physicians instantly via mobile SMS routing.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotify}
                  onChange={(e) => setSmsNotify(e.target.checked)}
                  className="w-4 h-4 text-clinical-accent focus:ring-clinical-accent border-slate-800 rounded bg-slate-900"
                />
              </div>

              <div className="flex justify-between items-center border-t border-slate-900/60 pt-3">
                <div>
                  <strong className="text-xs text-slate-200 block">Clinical Voice Announcements</strong>
                  <span className="text-[10px] text-slate-500">Synthesize audio overhead readouts for Code Blue alerts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSpeech}
                  onChange={(e) => setVoiceSpeech(e.target.checked)}
                  className="w-4 h-4 text-clinical-accent focus:ring-clinical-accent border-slate-800 rounded bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Sensitivity Controls */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel p-5 bg-gradient-to-br from-slate-900/60 to-slate-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-clinical-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Model Settings</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span>Deterioration Threshold</span>
                <span className="font-mono text-clinical-critical">{sensitivity}% risk</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-clinical-accent bg-slate-900 h-1.5 rounded-full outline-none"
              />
              <span className="text-[9px] text-slate-500 mt-1 block">Determines the risk percentage required to trigger high severity alarms.</span>
            </div>

            <div className="border-t border-slate-800/80 pt-3">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Model Check Frequency</label>
              <select
                value={modelUpdate}
                onChange={(e) => setModelUpdate(e.target.value)}
                className="glass-input w-full text-xs font-semibold"
              >
                <option value="15s" className="bg-slate-900">Every 15 Seconds</option>
                <option value="30s" className="bg-slate-900">Every 30 Seconds</option>
                <option value="60s" className="bg-slate-900">Every 60 Seconds</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
