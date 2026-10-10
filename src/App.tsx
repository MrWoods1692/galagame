// 应用入口：全屏标题 → 游戏/收集 的外层流程 + 手机端自动强制横屏
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import TitleScreen from './game/screens/TitleScreen';
import GameScreen from './game/screens/GameScreen';
import CollectionScreen from './game/screens/CollectionScreen';
import SettingsSheet from './game/components/SettingsSheet';
import OpenSourceSheet from './game/components/OpenSourceSheet';
import AutoLandscapeContainer from './game/components/AutoLandscapeContainer';
import { realBgmEngine } from './game/audio/realBgm';
import type { EventMemory } from './game/data/recallEvents';
import {
  hasAnySave,
  loadMeta,
  readSlot,
  saveMeta,
  slotSummary,
  SLOT_COUNT,
  type MetaState,
  type SaveData,
} from './game/store';

type Phase = 'title' | 'game' | 'collection';

const ASPECT_W = 16;
const ASPECT_H = 9;

const App: FC = () => {
  const [phase, setPhase] = useState<Phase>('title');
  const [meta, setMeta] = useState<MetaState>(loadMeta);
  const [initialSave, setInitialSave] = useState<SaveData | null>(null);
  const [recallStartLabel, setRecallStartLabel] = useState<string | undefined>(undefined);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [titleSettingsOpen, setTitleSettingsOpen] = useState(false);
  const [openSourceSheetOpen, setOpenSourceSheetOpen] = useState(false);
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  const [orientationMode, setOrientationMode] = useState<'landscape' | 'portrait'>(() => {
    const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('sakura_vn_orientation_mode') : null;
    return cached === 'portrait' ? 'portrait' : 'landscape';
  });

  // 计算游戏容器尺寸：
  // 1. 若处于横屏模式（手机竖屏下旋转90度），逻辑宽高交换后以 16:9 计算
  // 2. 若用户选择竖屏模式，逻辑宽高不交换，以屏幕宽度和自适应高度渲染
  const { gameWidth, gameHeight } = useMemo(() => {
    const isPhysicalPortrait = viewport.h > viewport.w;
    if (orientationMode === 'landscape' && isPhysicalPortrait) {
      const logicW = viewport.h;
      const logicH = viewport.w;
      const width = Math.min(logicW, (logicH * ASPECT_W) / ASPECT_H);
      const height = (width * ASPECT_H) / ASPECT_W;
      return { gameWidth: width, gameHeight: height };
    }

    if (orientationMode === 'portrait' && isPhysicalPortrait) {
      // 竖屏单手模式：铺满宽度，高度保持良好交互比例
      return { gameWidth: viewport.w, gameHeight: viewport.h };
    }

    // 默认桌面端或原生横屏
    const width = Math.min(viewport.w, (viewport.h * ASPECT_W) / ASPECT_H);
    const height = (width * ASPECT_H) / ASPECT_W;
    return { gameWidth: width, gameHeight: height };
  }, [viewport, orientationMode]);

  const updateMeta = useCallback((next: MetaState) => {
    setMeta(next);
    saveMeta(next);
  }, []);

  // BGM 音量跟随设置
  useEffect(() => {
    realBgmEngine.setVolume(meta.settings.bgmVolume);
  }, [meta.settings.bgmVolume]);

  // 首次交互后启动真实 BGM 轮播
  const ensureAudio = useCallback(() => {
    void realBgmEngine.init();
  }, []);

  const startNewGame = useCallback(() => {
    ensureAudio();
    setInitialSave(null);
    setRecallStartLabel(undefined);
    setIsRecallMode(false);
    setGameKey((k) => k + 1);
    setPhase('game');
  }, [ensureAudio]);

  const continueGame = useCallback(() => {
    ensureAudio();
    let latest: { slot: number; time: number } | null = null;
    for (let i = 0; i < SLOT_COUNT; i += 1) {
      const summary = slotSummary(i);
      if (summary) {
        const time = Date.parse(summary.savedAt);
        if (!latest || time > latest.time) latest = { slot: i, time };
      }
    }
    if (!latest) return;
    const data = readSlot(latest.slot, {
      mark: 'start',
      memory: { trust: 0, courage: 0 },
      backlog: [],
      savedAt: '',
      preview: '',
    });
    if (!data) return;
    setInitialSave(data);
    setRecallStartLabel(undefined);
    setIsRecallMode(false);
    setGameKey((k) => k + 1);
    setPhase('game');
  }, [ensureAudio]);

  const handlePlayRecall = useCallback((event: EventMemory) => {
    ensureAudio();
    setInitialSave(null);
    setRecallStartLabel(event.startLabel);
    setIsRecallMode(true);
    setGameKey((k) => k + 1);
    setPhase('game');
  }, [ensureAudio]);

  const hasSave = useMemo(() => phase !== 'title' || hasAnySave(), [phase, meta]);

  return (
    <AutoLandscapeContainer
      orientationMode={orientationMode}
      onModeChange={setOrientationMode}
    >
      <div className="relative h-full w-full bg-[#0A0909]">
        {/* 首页：全屏视频背景 */}
        {phase === 'title' && (
          <TitleScreen
            hasSave={hasSave}
            onNewGame={startNewGame}
            onContinue={continueGame}
            onCollection={() => setPhase('collection')}
            onSettings={() => setTitleSettingsOpen(true)}
            onOpenSource={() => setOpenSourceSheetOpen(true)}
          />
        )}

        {/* 游戏/收集：16:9 固定画幅，与桌面端比例一致 */}
        {(phase === 'game' || phase === 'collection') && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{
              width: `${gameWidth}px`,
              height: `${gameHeight}px`,
              fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif",
            }}
          >
            {phase === 'collection' && (
              <CollectionScreen
                unlockedEndings={meta.endings}
                unlockedEvents={meta.unlockedEvents}
                unlockedCGs={meta.unlockedCGs}
                onBack={() => setPhase('title')}
                onPlayRecall={handlePlayRecall}
              />
            )}

            {phase === 'game' && (
              <GameScreen
                key={gameKey}
                initialSave={initialSave}
                recallStartLabel={recallStartLabel}
                isRecallMode={isRecallMode}
                meta={meta}
                onMetaChange={updateMeta}
                onExit={() => {
                  if (isRecallMode) {
                    setPhase('collection');
                  } else {
                    setPhase('title');
                  }
                }}
                onRestart={startNewGame}
              />
            )}
          </div>
        )}

        {titleSettingsOpen && (
          <SettingsSheet
            settings={meta.settings}
            onChange={(settings) => updateMeta({ ...meta, settings })}
            onClose={() => setTitleSettingsOpen(false)}
            onOpenSource={() => {
              setTitleSettingsOpen(false);
              setOpenSourceSheetOpen(true);
            }}
            onDataImported={updateMeta}
          />
        )}

        {openSourceSheetOpen && (
          <OpenSourceSheet onClose={() => setOpenSourceSheetOpen(false)} />
        )}
      </div>
    </AutoLandscapeContainer>
  );
};

export default App;
