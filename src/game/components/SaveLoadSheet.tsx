// 存档 / 读档面板：6 个独立槽位，支持显示保存时间与剧情缩略图
import type { FC } from 'react';
import { X, Image as ImageIcon, Clock } from 'lucide-react';
import { SLOT_COUNT, slotSummary } from '../store';

interface SaveLoadSheetProps {
  mode: 'save' | 'load';
  onClose: () => void;
  onPick: (slot: number) => void;
}

const SaveLoadSheet: FC<SaveLoadSheetProps> = ({ mode, onClose, onPick }) => {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => ({
    slot: i,
    summary: slotSummary(i),
  }));

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 9, 9, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-[94%] max-w-[720px] max-h-[88%] flex flex-col border border-[#E8A7A1]/30 bg-[#161313]/95 p-6 shadow-2xl backdrop-blur-md"
        style={{ animation: 'vn-sheet-in 150ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#3A3333] pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium tracking-[0.3em] text-[#F5F2EB]">
              {mode === 'save' ? '保存进度 · 6槽位' : '读取进度 · 6槽位'}
            </h2>
            <span className="text-xs text-[#A9A49C]">点击卡片执行{mode === 'save' ? '存档' : '读取'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#8C8480] transition-colors hover:bg-[#2A2323] hover:text-[#E8A7A1]"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* 6 个槽位卡片：2 列 × 3 行网格 */}
        <div className="grid grid-cols-2 gap-3.5 overflow-y-auto pr-1">
          {slots.map(({ slot, summary }) => {
            const hasData = !!summary;
            return (
              <button
                key={slot}
                type="button"
                disabled={mode === 'load' && !hasData}
                onClick={() => onPick(slot)}
                className="group relative flex flex-col overflow-hidden border border-[#3E3636] bg-[#1F1A1B] text-left transition-all hover:border-[#E8A7A1] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {/* 缩略图区域 */}
                <div className="relative h-24 w-full bg-[#120F10] overflow-hidden">
                  {summary?.previewBg ? (
                    <img
                      src={summary.previewBg}
                      alt="存档缩略图"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#181415] text-[#554D4B]">
                      <ImageIcon className="h-6 w-6 stroke-1 opacity-50" />
                    </div>
                  )}
                  {/* 槽位标签 */}
                  <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wider text-[#F4B8B0] backdrop-blur-sm">
                    槽位 {slot + 1}
                  </span>
                  {!hasData && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs tracking-widest text-[#786E6B]">
                      空槽位
                    </span>
                  )}
                </div>

                {/* 文字与时间详情 */}
                <div className="flex flex-1 flex-col justify-between p-2.5">
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#DCD6CE]">
                    {hasData ? summary.preview || '（无对话预览）' : '暂无数据'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8A817D]">
                    <Clock className="h-3 w-3" />
                    <span>
                      {hasData
                        ? new Date(summary.savedAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                          })
                        : '尚未保存'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadSheet;
