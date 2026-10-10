// 樱花角标装饰 SVG 图标组件
import type { FC } from 'react';

interface SakuraCornerProps {
  className?: string;
  flipX?: boolean;
  flipY?: boolean;
}

export const SakuraCorner: FC<SakuraCornerProps> = ({ className = '', flipX = false, flipY = false }) => {
  const transform = `${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`.trim();

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: transform || undefined }}
    >
      {/* 角落边线细饰 */}
      <path
        d="M 2 24 L 2 2 L 24 2"
        stroke="#E8A7A1"
        strokeWidth="1.2"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      {/* 主樱花瓣 */}
      <path
        d="M 12 12 C 10 7, 16 5, 17 9 C 18 5, 24 7, 22 12 C 25 10, 27 16, 23 17 C 27 18, 25 24, 20 22 C 22 25, 16 27, 15 23 C 14 27, 8 25, 10 20 C 7 22, 5 16, 9 15 C 5 14, 7 8, 12 12 Z"
        fill="#F4B8B0"
        fillOpacity="0.75"
      />
      {/* 花蕊与阴影 */}
      <circle cx="16" cy="16" r="2.2" fill="#E27380" fillOpacity="0.8" />
      <circle cx="16" cy="16" r="1" fill="#FFF2F0" />
      {/* 飘散的小花瓣 */}
      <path
        d="M 27 7 C 26 4, 30 4, 30 7 C 30 9, 27 9, 27 7 Z"
        fill="#F8CAC5"
        fillOpacity="0.6"
      />
      <path
        d="M 7 27 C 4 26, 4 30, 7 30 C 9 30, 9 27, 7 27 Z"
        fill="#F8CAC5"
        fillOpacity="0.6"
      />
    </svg>
  );
};
