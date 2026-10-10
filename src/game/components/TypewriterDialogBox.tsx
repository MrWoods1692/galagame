// 逐字打印与标点顿挫对话框组件
// 支持遇到标点停顿、点击跳过补全、再次点击推进
import { useEffect, useRef, useState, type FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { SakuraCorner } from './SakuraCorner';

interface TypewriterDialogBoxProps {
  speaker: string;
  text: string;
  canAdvance: boolean;
  onAdvance: () => void;
  textSpeedMultiplier?: number; // 默认 1.0，越大越快
}

const PUNCTUATION_PAUSES: Record<string, number> = {
  '，': 160,
  ',': 160,
  '、': 140,
  '。': 320,
  '.': 320,
  '！': 300,
  '!': 300,
  '？': 320,
  '?': 320,
  '…': 380,
  '—': 240,
  '：': 180,
  ':': 180,
  '；': 200,
  ';': 200,
};

export const TypewriterDialogBox: FC<TypewriterDialogBoxProps> = ({
  speaker,
  text,
  canAdvance,
  onAdvance,
  textSpeedMultiplier = 1,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isComplete = displayedLength >= text.length;
  const isNarration = speaker === '旁白';

  // 基础打字间隔 (毫秒)
  const baseInterval = Math.max(12, Math.round(36 / Math.max(0.5, textSpeedMultiplier)));

  // 当外部 text 变化时重新启动逐字打字
  useEffect(() => {
    setDisplayedLength(0);
    if (!text) return;

    let currentIndex = 0;

    const printNext = () => {
      currentIndex++;
      setDisplayedLength(currentIndex);

      if (currentIndex >= text.length) {
        return;
      }

      const char = text[currentIndex - 1];
      const punctuationDelay = PUNCTUATION_PAUSES[char] ?? 0;
      const delay = baseInterval + punctuationDelay;

      timerRef.current = window.setTimeout(printNext, delay);
    };

    timerRef.current = window.setTimeout(printNext, baseInterval);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, baseInterval]);

  // 点击交互：如果未完成则跳过并直接显示全文；如果已完成则推进下一句
  const handleClick = () => {
    if (!isComplete) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setDisplayedLength(text.length);
    } else if (canAdvance) {
      onAdvance();
    }
  };

  const visibleText = text.slice(0, displayedLength);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 cursor-pointer px-[4%] pb-[3%]"
      style={{ height: '32%' }}
      onClick={handleClick}
    >
      <div className="relative h-full">
        {!isNarration && (
          <div
            className="absolute -top-9 left-0 z-10 flex h-9 items-center border border-[#E8A7A1]/40 bg-[#1A1616]/90 px-5 shadow-md backdrop-blur-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span className="text-base tracking-[0.3em] font-medium text-[#F7F3EE]">{speaker}</span>
          </div>
        )}
        <div
          className="relative flex h-full flex-col border border-[#E8A7A1]/30 px-8 py-6 backdrop-blur-md shadow-2xl transition-all"
          style={{
            backgroundColor: 'rgba(20, 16, 17, 0.82)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 235, 235, 0.1)',
          }}
        >
          {/* 四个角的日系樱花与和风角标装饰 */}
          <SakuraCorner className="absolute top-1.5 left-1.5 h-6 w-6" />
          <SakuraCorner className="absolute top-1.5 right-1.5 h-6 w-6" flipX />
          <SakuraCorner className="absolute bottom-1.5 left-1.5 h-6 w-6" flipY />
          <SakuraCorner className="absolute bottom-1.5 right-1.5 h-6 w-6" flipX flipY />

          <p
            className={`text-lg leading-9 text-[#F5F2EB] ${isNarration ? 'tracking-wider italic text-[#E2D8D5]' : ''}`}
            style={{
              userSelect: 'text',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
            }}
          >
            {visibleText}
            {/* 未打完时显示樱粉色微光光标 */}
            {!isComplete && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#F4B8B0] align-middle shadow-[0_0_6px_#F4B8B0]" />
            )}
          </p>

          {/* 右下角跳过/完成指示器 */}
          {isComplete && canAdvance && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1">
              <span className="text-[10px] tracking-widest text-[#E8A7A1]/80">▼</span>
              <ChevronDown
                className="h-4 w-4 animate-bounce text-[#F4B8B0]"
                strokeWidth={1.8}
              />
            </div>
          )}
          {!isComplete && (
            <span className="absolute bottom-2 right-4 text-[10px] tracking-widest text-[#B5ABA7] opacity-80">
              点击跳过打字
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypewriterDialogBox;
