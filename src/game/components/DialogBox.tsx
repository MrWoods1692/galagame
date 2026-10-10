// 对话框：物哀书签风 —— 直角、磨砂深碳底、姓名标牌凸出左上
import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface DialogBoxProps {
  speaker: string;
  text: string;
  canAdvance: boolean;
  onAdvance: () => void;
}

const DialogBox: FC<DialogBoxProps> = ({ speaker, text, canAdvance, onAdvance }) => {
  const isNarration = speaker === '旁白';
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 cursor-pointer px-[4%] pb-[3%]"
      style={{ height: '32%' }}
      onClick={() => canAdvance && onAdvance()}
    >
      <div className="relative h-full">
        {!isNarration && (
          <div
            className="absolute -top-9 left-0 z-10 flex h-9 items-center border border-[#43403D] bg-[#181716] px-5"
          >
            <span className="text-base tracking-[0.3em] text-[#E8E4DE]">{speaker}</span>
          </div>
        )}
        <div
          className="flex h-full flex-col border border-[#43403D] px-8 py-6"
          style={{ backgroundColor: 'rgba(18, 17, 17, 0.88)' }}
        >
          <p
            className={`text-lg leading-9 text-[#E8E4DE] ${isNarration ? 'tracking-wider' : ''}`}
            style={{ userSelect: 'text' }}
          >
            {text}
          </p>
          {canAdvance && (
            <ChevronDown
              className="absolute bottom-3 right-4 h-4 w-4 animate-bounce text-[#76736E]"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
