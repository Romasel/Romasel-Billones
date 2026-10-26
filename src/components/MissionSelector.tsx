/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrainingMission } from '../types/pipeline';
import { CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';

interface MissionSelectorProps {
  missions: TrainingMission[];
  selectedMissionId: string;
  onSelectMission: (missionId: string) => void;
  completedMissionIds: Set<string>;
}

export const MissionSelector: React.FC<MissionSelectorProps> = ({
  missions,
  selectedMissionId,
  onSelectMission,
  completedMissionIds,
}) => {
  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider shrink-0">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>Labs:</span>
        </div>

        {missions.map((mission, idx) => {
          const isSelected = mission.id === selectedMissionId;
          const isCompleted = completedMissionIds.has(mission.id);

          return (
            <button
              key={mission.id}
              onClick={() => onSelectMission(mission.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border ${
                isSelected
                  ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 shadow-sm'
                  : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:text-slate-100'
              }`}
            >
              <span className="font-mono text-[11px] text-slate-500">{`0${idx + 1}`}</span>
              <span>{mission.title}</span>

              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <span className="text-[10px] text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.2">
                  {mission.difficulty}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
