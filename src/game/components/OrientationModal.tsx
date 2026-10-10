// 移动端屏幕方向引导弹窗：提醒用户选择横屏模式或竖屏模式
import type { FC } from 'react';
import { Smartphone, MonitorPlay, Sparkles } from 'lucide-react';

interface OrientationModalProps {
  onSelect: (mode: 'landscape' | 'portrait') => void;
}

export const OrientationModal: FC<OrientationModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div
        className="w-[90%] max-w-[380px] rounded-lg border border-[#E8A7A1]/40 bg-[#191516] p-6 text-center shadow-2xl"
        style={{ animation: 'vn-sheet-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8A7A1]/10 text-[#F4B8B0]">
          <Sparkles className="h-6 w-6" />
        </div>

        <h3 className="text-base font-medium tracking-[0.2em] text-[#F7F3EE]">选择显示模式</h3>
        <p className="mt-2 text-xs leading-relaxed text-[#A9A49C]">
          检测到您正在使用移动端设备访问，请选择更符合您习惯的显示模式以获得最佳体验：
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {/* 横屏模式选项 */}
          <button
            type="button"
            onClick={() => onSelect('landscape')}
            className="group flex items-center justify-between rounded border border-[#E8A7A1]/40 bg-[#241D1E] p-3 text-left transition-all hover:border-[#E8A7A1] hover:bg-[#2C2325]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-black/40 text-[#F4B8B0]">
                <MonitorPlay className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#F5F2EB] group-hover:text-[#F4B8B0]">
                  横屏沉浸模式
                </div>
                <div className="text-[11px] text-[#8C8480]">推荐体验，保持日式经典宽幅影院画幅</div>
              </div>
            </div>
            <span className="rounded bg-[#C34043]/20 px-2 py-0.5 text-[10px] text-[#F4B8B0] border border-[#C34043]/30">
              推荐
            </span>
          </button>

          {/* 竖屏模式选项 */}
          <button
            type="button"
            onClick={() => onSelect('portrait')}
            className="group flex items-center justify-between rounded border border-[#3E3636] bg-[#1E191A] p-3 text-left transition-all hover:border-[#E8A7A1] hover:bg-[#282122]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-black/40 text-[#B5ABA7]">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#DCD6CE] group-hover:text-[#F5F2EB]">
                  竖屏单手模式
                </div>
                <div className="text-[11px] text-[#8C8480]">竖向手持，自适应视口比例浏览</div>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-4 text-[10px] text-[#706866]">
          您可以在游戏过程中随时通过左上方悬浮按钮切换显示方向
        </p>
      </div>
    </div>
  );
};
