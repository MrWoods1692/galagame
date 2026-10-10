// 标题画面：本地静态背景 + 本地 Logo + 主菜单
// 注意：本组件处于 AutoLandscapeContainer 提供的横屏画布内，因此背景与 Logo 均按横屏比例铺满
import type { FC } from 'react';
import { ttsPlayer } from '../audio/ttsPlayer';
import { BACKGROUNDS } from '../assets';
import titleLogo from '@/assets/logo/title-logo.png';

interface TitleScreenProps {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onCollection: () => void;
  onSettings: () => void;
  onOpenSource: () => void;
}

const TitleScreen: FC<TitleScreenProps> = (props) => {
  const menu: Array<{ key: string; label: string; disabled?: boolean; onClick: () => void }> = [
    {
      key: 'new',
      label: '开始游戏',
      onClick: () => {
        ttsPlayer.unlockAudio();
        props.onNewGame();
      },
    },
    {
      key: 'continue',
      label: '继续游戏',
      disabled: !props.hasSave,
      onClick: () => {
        ttsPlayer.unlockAudio();
        props.onContinue();
      },
    },
    { key: 'collection', label: '结局收集', onClick: props.onCollection },
    { key: 'settings', label: '设置', onClick: props.onSettings },
    { key: 'source', label: '开源仓库', onClick: props.onOpenSource },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* 全屏静态背景：夜樱场景，缓慢推镜营造氛围 */}
      <img
        src={BACKGROUNDS.night_sakura}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: 'brightness(0.62) saturate(0.92)',
          animation: 'vn-title-zoom 32s ease-in-out infinite alternate both',
        }}
      />

      {/* 上下渐变遮罩，增强文字可读性 */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,9,9,0.2), rgba(10,9,9,0.62))' }}
      />

      <div className="absolute inset-0 flex select-none">
        {/* 左侧透明图片 Logo */}
        <div className="flex flex-1 items-center justify-center pl-[6%]">
          <img
            src={titleLogo}
            alt="樱花时节"
            className="h-auto max-h-[70%] w-auto object-contain"
            style={{
              filter: 'drop-shadow(0 2px 18px rgba(0,0,0,0.55))',
              WebkitFilter: 'drop-shadow(0 2px 18px rgba(0,0,0,0.55))',
            }}
          />
        </div>

        {/* 右侧菜单 */}
        <div className="flex w-[520px] max-w-[40%] flex-col items-start justify-center gap-3 pr-[6%]">
          {menu.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className="group relative w-full max-w-[320px] border border-[#43403D] px-6 py-3.5 text-left transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-35"
              style={{ backgroundColor: 'rgba(18, 17, 17, 0.78)' }}
              onMouseEnter={(e) => {
                if (!item.disabled) e.currentTarget.style.backgroundColor = '#C34043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(18, 17, 17, 0.78)';
              }}
            >
              <span className="absolute left-0 top-0 h-full w-[2px] bg-[#E8E4DE] opacity-0 transition-opacity duration-100 group-hover:opacity-100" />
              <span className="text-sm tracking-[0.4em] text-[#E8E4DE]">{item.label}</span>
            </button>
          ))}
          <p className="mt-6 text-[10px] tracking-[0.25em] text-[#76736E]">
            一个关于告别、约定与遗憾的故事
          </p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
