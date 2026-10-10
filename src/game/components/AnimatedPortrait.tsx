// 角色立绘组件：支持情绪切换呼吸浮动动效（已移除人工眨眼遮罩，保证原画纯净）
import { memo, useEffect, useRef, useState, type FC } from 'react';
import { PORTRAITS, type PortraitId, type PortraitSlot } from '../assets';

interface AnimatedPortraitProps {
  id: PortraitId;
  slot: PortraitSlot;
  className?: string;
  style?: React.CSSProperties;
}

const SLOT_CLASS: Record<PortraitSlot, string> = {
  left: 'left-[14%]',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-[14%]',
};

export const AnimatedPortrait: FC<AnimatedPortraitProps> = memo(({
  id,
  slot,
  className = '',
  style = {},
}) => {
  // 情绪切换时的呼吸浮动反馈
  const [isEmotionPulsing, setIsEmotionPulsing] = useState(false);
  const prevIdRef = useRef(id);

  useEffect(() => {
    if (prevIdRef.current !== id) {
      prevIdRef.current = id;
      setIsEmotionPulsing(true);
      const timer = setTimeout(() => setIsEmotionPulsing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [id]);

  return (
    <div
      className={`absolute bottom-0 z-10 pointer-events-none select-none ${SLOT_CLASS[slot]} ${className}`}
      style={{
        height: '86%',
        ...style,
      }}
    >
      {/* 呼吸浮动包装层：包含轻微呼吸动画 + 情绪切换时的自然心跳微动 */}
      <div
        className={`relative h-full w-full transition-transform duration-700 ease-out ${
          isEmotionPulsing ? 'animate-emotion-pulse' : 'animate-subtle-breathe'
        }`}
        style={{
          transformOrigin: 'bottom center',
        }}
      >
        {/* 立绘主图：保持纯净原画呈现，无任何遮挡 */}
        <img
          src={PORTRAITS[id]}
          alt={id}
          className="h-full w-auto object-contain transition-all duration-300"
          style={{
            animation: 'vn-fade-in 300ms linear both',
            filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.45))',
          }}
        />
      </div>
    </div>
  );
});

AnimatedPortrait.displayName = 'AnimatedPortrait';
export default AnimatedPortrait;
