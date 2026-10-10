// 结局画面：黑幕渐显终章文字，逐句点进，结尾盖印
import { useCallback, useState, type FC } from 'react';
import { ENDINGS } from '../data/endings';
import { BACKGROUNDS } from '../assets';

interface EndingOverlayProps {
  endingId: string;
  onHome: () => void;
  onRestart: () => void;
}

const TONE_LABEL = { tragedy: '悲剧结局', regret: '遗憾结局', redemption: '救赎结局' } as const;

const EndingOverlay: FC<EndingOverlayProps> = ({ endingId, onHome, onRestart }) => {
  const ending = ENDINGS[endingId];
  const [step, setStep] = useState(0);
  const done = !ending || step >= ending.epilogue.length;

  const advance = useCallback(() => {
    if (!done) setStep((s) => s + 1);
  }, [done]);

  if (!ending) return null;

  return (
    <div
      className="absolute inset-0 z-50 cursor-pointer"
      style={{ animation: 'vn-fade-in 600ms linear both' }}
      onClick={advance}
    >
      <img
        src={BACKGROUNDS[ending.bg]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.55) saturate(0.9)' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[10%]">
        {!done ? (
          <p
            key={step}
            className="max-w-[720px] text-center text-xl leading-10 text-[#E8E4DE]"
            style={{ animation: 'vn-fade-in 400ms linear both' }}
          >
            {ending.epilogue[step]}
          </p>
        ) : (
          <div
            className="flex flex-col items-center"
            style={{ animation: 'vn-fade-in 500ms linear both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mb-4 border border-[#C34043] px-3 py-1 text-xs tracking-[0.5em] text-[#C34043]">
              {ending.no} · {TONE_LABEL[ending.tone]}
            </span>
            <h2 className="mb-3 text-4xl tracking-[0.2em] text-[#E8E4DE]">{ending.title}</h2>
            <p className="mb-10 text-sm tracking-[0.3em] text-[#76736E]">{ending.subtitle} · 已收录至结局收集</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onRestart}
                className="border border-[#43403D] px-8 py-3 text-sm tracking-[0.3em] text-[#E8E4DE] hover:border-[#C34043] hover:text-[#C34043]"
              >
                重新开始
              </button>
              <button
                type="button"
                onClick={onHome}
                className="border border-[#43403D] px-8 py-3 text-sm tracking-[0.3em] text-[#A9A49C] hover:border-[#C34043] hover:text-[#C34043]"
              >
                返回主页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndingOverlay;
