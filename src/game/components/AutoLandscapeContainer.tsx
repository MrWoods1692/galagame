// 移动端多模式自适应容器组件
// 支持横屏强制旋转（保持 16:9 电影质感）与竖屏自适应模式，并提供随时切换按钮
import { useEffect, useState, type FC, type ReactNode } from 'react';
import { Smartphone, MonitorPlay } from 'lucide-react';
import { OrientationModal } from './OrientationModal';

interface AutoLandscapeContainerProps {
  children: ReactNode;
  orientationMode?: 'landscape' | 'portrait';
  onModeChange?: (mode: 'landscape' | 'portrait') => void;
}

const STORAGE_KEY = 'sakura_vn_orientation_mode';

export const AutoLandscapeContainer: FC<AutoLandscapeContainerProps> = ({
  children,
  orientationMode: controlledMode,
  onModeChange,
}) => {
  const [windowSize, setWindowSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  const [mode, setMode] = useState<'landscape' | 'portrait'>(() => {
    if (controlledMode) return controlledMode;
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return cached === 'portrait' ? 'portrait' : 'landscape';
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (controlledMode) {
      setMode(controlledMode);
    }
  }, [controlledMode]);

  useEffect(() => {
    // 监听窗口尺寸变化
    const updateSize = () => {
      setWindowSize({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    // 判断是否为移动设备
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth < 800 && window.innerHeight > window.innerWidth);

    const hasChosen = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (isMobile && !hasChosen) {
      setShowModal(true);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  const handleSelectMode = (newMode: 'landscape' | 'portrait') => {
    setMode(newMode);
    setShowModal(false);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
    onModeChange?.(newMode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'landscape' ? 'portrait' : 'landscape';
    handleSelectMode(nextMode);
  };

  const isPhysicallyPortrait = windowSize.h > windowSize.w;
  const isMobile = windowSize.w <= 900 || isPhysicallyPortrait;

  // 1. 横屏模式：当用户选择横屏模式且手机处于竖屏状态时，将内容旋转 90 度以获得满屏 16:9 横屏体验
  if (mode === 'landscape' && isPhysicallyPortrait) {
    const screenW = windowSize.w;
    const screenH = windowSize.h;

    return (
      <div
        className="fixed inset-0 overflow-hidden bg-[#0A0909]"
        style={{ width: `${screenW}px`, height: `${screenH}px` }}
      >
        <div
          style={{
            position: 'absolute',
            width: `${screenH}px`,
            height: `${screenW}px`,
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `translate(${screenW}px, 0px) rotate(90deg)`,
            overflow: 'hidden',
          }}
        >
          {children}

          {/* 切换横/竖屏悬浮按钮 */}
          <button
            type="button"
            onClick={toggleMode}
            title="切换为竖屏模式"
            className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] text-[#F4B8B0] backdrop-blur-md shadow-lg"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>切为竖屏</span>
          </button>
        </div>

        {showModal && <OrientationModal onSelect={handleSelectMode} />}
      </div>
    );
  }

  // 2. 竖屏模式或宽屏设备：直接正常比例渲染
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0909]">
      {children}

      {/* 移动端且物理竖屏时，提供随时切换为横屏旋转的便捷悬浮按钮 */}
      {isMobile && isPhysicallyPortrait && mode === 'portrait' && (
        <button
          type="button"
          onClick={toggleMode}
          title="切换为横屏沉浸模式"
          className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[11px] text-[#F4B8B0] backdrop-blur-md shadow-lg"
        >
          <MonitorPlay className="h-3.5 w-3.5" />
          <span>切为横屏</span>
        </button>
      )}

      {showModal && <OrientationModal onSelect={handleSelectMode} />}
    </div>
  );
};

export default AutoLandscapeContainer;
