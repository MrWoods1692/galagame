// 历史记录面板：回溯本次流程已读对话
import type { FC } from 'react';
import { X } from 'lucide-react';
import type { BacklogEntry } from '../store';

interface BacklogSheetProps {
  entries: BacklogEntry[];
  onClose: () => void;
}

const BacklogSheet: FC<BacklogSheetProps> = ({ entries, onClose }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 9, 9, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="flex h-[70%] w-[88%] max-w-[640px] flex-col border border-[#43403D] bg-[#181716] p-6"
        style={{ animation: 'vn-sheet-in 150ms linear both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm tracking-[0.4em] text-[#E8E4DE]">历史记录</h2>
          <button type="button" onClick={onClose} className="text-[#76736E] hover:text-[#C34043]">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2" style={{ userSelect: 'text' }}>
          {entries.length === 0 && (
            <p className="text-sm text-[#76736E]">还没有已读的对话。</p>
          )}
          {entries.map((entry, i) => (
            <div key={i} className="mb-4 border-l-2 border-[#43403D] pl-4">
              {entry.speaker !== '旁白' && (
                <span className="mb-1 block text-xs tracking-[0.3em] text-[#D08C4A]">{entry.speaker}</span>
              )}
              <p className="text-sm leading-6 text-[#A9A49C]">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacklogSheet;
