// 顶部右侧控制栏：36px 纯文字操作，支持 BGM 播放信息与切歌
import type { FC } from 'react';
import { Music } from 'lucide-react';

interface ControlBarProps {
  ffActive: boolean;
  autoActive: boolean;
  currentBgmTitle?: string;
  onNextBgm?: () => void;
  onSave: () => void;
  onLoad: () => void;
  onToggleFf: () => void;
  onToggleAuto: () => void;
  onBacklog: () => void;
  onSettings: () => void;
  onHome: () => void;
}

const ControlBar: FC<ControlBarProps> = (props) => {
  const items: Array<{ key: string; label: string; active?: boolean; onClick: () => void }> = [
    { key: 'save', label: '保存', onClick: props.onSave },
    { key: 'load', label: '读取', onClick: props.onLoad },
    { key: 'ff', label: '快进', active: props.ffActive, onClick: props.onToggleFf },
    { key: 'auto', label: '自动', active: props.autoActive, onClick: props.onToggleAuto },
    { key: 'log', label: '记录', onClick: props.onBacklog },
    { key: 'settings', label: '设置', onClick: props.onSettings },
    { key: 'home', label: '主页', onClick: props.onHome },
  ];

  return (
    <div className="absolute right-3 top-3 z-40 flex h-9 items-stretch border border-[#43403D]" style={{ backgroundColor: 'rgba(18, 17, 17, 0.88)' }}>
      {/* 实时轮播曲目标识 */}
      {props.currentBgmTitle && (
        <button
          type="button"
          onClick={props.onNextBgm}
          title="点击随机切换下一首 BGM"
          className="flex items-center gap-1.5 border-r border-[#43403D] px-3 text-xs tracking-wider text-[#D08C4A] hover:text-[#E8E4DE]"
        >
          <Music className="h-3.5 w-3.5 animate-pulse" />
          <span>{props.currentBgmTitle}</span>
        </button>
      )}

      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className="border-r border-[#43403D] px-3 text-xs tracking-[0.2em] last:border-r-0 hover:text-[#C34043]"
          style={{ color: item.active ? '#D08C4A' : '#A9A49C' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ControlBar;
