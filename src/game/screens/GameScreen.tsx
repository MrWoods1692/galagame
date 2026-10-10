// 游戏主场景：驱动 scenario 控制器，渲染背景 / 立绘 / 对话 / 分支 / 转场特效 / 语音合成与动效
import { useCallback, useEffect, useReducer, useRef, useState, type FC } from 'react';
import { ScenarioController } from 'miaoda-game-scenario-react';
import { SCRIPT } from '../script';
import { BACKGROUNDS, PORTRAITS, type BackgroundId, type PortraitId, type PortraitSlot } from '../assets';
import { realBgmEngine } from '../audio/realBgm';
import { ttsPlayer } from '../audio/ttsPlayer';
import {
  readSlot,
  writeSlot,
  type BacklogEntry,
  type MetaState,
  type SaveData,
} from '../store';
import TypewriterDialogBox from '../components/TypewriterDialogBox';
import ChoiceMenu from '../components/ChoiceMenu';
import ControlBar from '../components/ControlBar';
import SaveLoadSheet from '../components/SaveLoadSheet';
import SettingsSheet from '../components/SettingsSheet';
import BacklogSheet from '../components/BacklogSheet';
import EndingOverlay from '../components/EndingOverlay';
import { SakuraTransition } from '../components/SakuraTransition';
import AnimatedPortrait from '../components/AnimatedPortrait';

interface GameScreenProps {
  initialSave: SaveData | null;
  recallStartLabel?: string;
  isRecallMode?: boolean;
  meta: MetaState;
  onMetaChange: (meta: MetaState) => void;
  onExit: () => void;
  onRestart: () => void;
}

type SheetKind = 'save' | 'load' | 'settings' | 'backlog' | null;

interface Line {
  speaker: string;
  text: string;
}

type PortraitsState = Partial<Record<PortraitSlot, PortraitId>>;

const EMPTY_SAVE: SaveData = { mark: 'start', memory: { trust: 0, courage: 0 }, backlog: [], savedAt: '', preview: '' };

const GameScreen: FC<GameScreenProps> = ({
  initialSave,
  recallStartLabel,
  isRecallMode = false,
  meta,
  onMetaChange,
  onExit,
  onRestart,
}) => {
  const controllerRef = useRef<ScenarioController | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const processedCmdRef = useRef<object | null>(null);
  const markRef = useRef<string>(recallStartLabel ?? 'start');
  const backlogRef = useRef<BacklogEntry[]>(initialSave?.backlog ?? []);
  const startReadRef = useRef<Set<string>>(new Set(meta.readTexts));
  const sessionReadRef = useRef<Set<string>>(new Set());
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const [, force] = useReducer((x: number) => x + 1, 0);
  const [line, setLine] = useState<Line | null>(null);
  const [bg, setBg] = useState<BackgroundId>('classroom_sunset');
  const [portraits, setPortraits] = useState<PortraitsState>({});
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [ffMode, setFfMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentBgmTitle, setCurrentBgmTitle] = useState(() => realBgmEngine.getCurrentTrack().title);
  const [isSpeaking, setIsSpeaking] = useState(() => ttsPlayer.isSpeaking());

  // 监听 TTS 语音播放状态
  useEffect(() => {
    return ttsPlayer.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // 同步 TTS 音量与开关设置
  useEffect(() => {
    ttsPlayer.setEnabled(meta.settings.ttsEnabled);
    ttsPlayer.setVolume(meta.settings.ttsVolume);
  }, [meta.settings.ttsEnabled, meta.settings.ttsVolume]);

  // 监听 BGM 变化
  useEffect(() => {
    return realBgmEngine.subscribe(() => {
      setCurrentBgmTitle(realBgmEngine.getCurrentTrack().title);
    });
  }, []);

  // 退出或卸载时停止语音
  useEffect(() => {
    return () => {
      ttsPlayer.stop();
    };
  }, []);

  // ── 创建并启动控制器（新开局、回想或从存档点重放）──
  // biome-ignore lint/correctness/useExhaustiveDependencies: initialSave 和 recallStartLabel 仅在挂载时使用
  useEffect(() => {
    const initialMark = recallStartLabel ?? (initialSave ? initialSave.mark : undefined);
    const initialMemory = recallStartLabel
      ? { trust: 2, courage: 2 }
      : initialSave
        ? { ...initialSave.memory }
        : { trust: 0, courage: 0 };

    const ctrl = new ScenarioController({
      source: SCRIPT,
      memory: initialMemory,
    });
    controllerRef.current = ctrl;
    unsubscribeRef.current = ctrl.onChange(() => force());

    void ctrl.start(initialMark).catch(() => setToast('剧情脚本执行出错'));

    return () => {
      unsubscribeRef.current?.();
      ctrl.stop();
      controllerRef.current = null;
    };
  }, []);

  const view = controllerRef.current?.view ?? null;
  const pendingCmd = view?.pendingCommand ?? null;
  const choices = view?.choices ?? [];
  const status = view?.status ?? 'idle';

  // ── 命令处理：say 阻塞等待点击并播放语音，其余即时执行后放行 ──
  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl || !pendingCmd || processedCmdRef.current === pendingCmd) return;
    processedCmdRef.current = pendingCmd;
    const [a0, a1] = pendingCmd.args;

    switch (pendingCmd.name) {
      case 'say': {
        const next = { speaker: a0 ?? '旁白', text: a1 ?? '' };
        setLine(next);
        backlogRef.current = [...backlogRef.current.slice(-99), next];
        sessionReadRef.current.add(next.speaker + next.text);

        // 触发本地静态 MP3 语音同步播放
        if (next.text) {
          void ttsPlayer.speak(next.text, {
            speaker: next.speaker,
            label: markRef.current,
          });
        }
        return; // 阻塞：等待玩家推进
      }
      case 'bg':
        if (a0 && a0 in BACKGROUNDS) {
          // 解锁对应背景的 CG
          const cgKey = `cg_${a0}`;
          if (!meta.unlockedCGs?.includes(cgKey)) {
            onMetaChange({
              ...meta,
              unlockedCGs: [...(meta.unlockedCGs || []), cgKey],
            });
          }

          if (a0 !== bg) {
            // 场景切换时触发黑幕淡出淡入过渡
            setIsTransitioning(true);
            setTimeout(() => {
              setBg(a0 as BackgroundId);
              setTimeout(() => {
                setIsTransitioning(false);
              }, 250);
            }, 300);
          }
        }
        break;
      case 'show':
        if (a0 && a0 in PORTRAITS) {
          const slot = (a1 === 'left' || a1 === 'right' ? a1 : 'center') as PortraitSlot;
          setPortraits((p) => ({ ...p, [slot]: a0 as PortraitId }));
        }
        break;
      case 'hide':
        setPortraits((p) => {
          const next = { ...p };
          (Object.keys(next) as PortraitSlot[]).forEach((slot) => {
            if (next[slot] === a0) delete next[slot];
          });
          return next;
        });
        break;
      case 'mark':
        markRef.current = a0 ?? markRef.current;
        break;
      case 'bgm':
        // 剧本指定曲风时切换本地合成 BGM
        if (a0) realBgmEngine.playMood(a0);
        break;
      case 'event': {
        // 解锁关键事件回想
        const eventId = a0 ?? '';
        if (eventId) {
          const m = metaRef.current;
          if (!m.unlockedEvents.includes(eventId)) {
            onMetaChange({
              ...m,
              unlockedEvents: [...m.unlockedEvents, eventId],
            });
            setToast('已收录事件回想');
          }
        }
        break;
      }
      case 'ending': {
        const id = a0 ?? '';
        setEndingId(id);
        const m = metaRef.current;
        onMetaChange({
          ...m,
          endings: m.endings.includes(id) ? m.endings : [...m.endings, id],
          readTexts: Array.from(new Set([...m.readTexts, ...sessionReadRef.current])),
        });
        break;
      }
      default:
        break;
    }
    ctrl.continueCommand();
  }, [pendingCmd, onMetaChange, bg, meta]);

  // ── 状态收尾：脚本结束但无 ending 标记时（例如回想结束）提示并可返回 ──
  useEffect(() => {
    if (status === 'error') setToast('剧情脚本执行出错');
  }, [status]);

  // ── 选项出现时退出快进 ──
  useEffect(() => {
    if (choices.length > 0) setFfMode(false);
  }, [choices.length]);

  const sheetOpen = sheet !== null;
  const choicesOpen = choices.length > 0;
  const canAdvance = !sheetOpen && !choicesOpen && pendingCmd?.name === 'say';

  const advance = useCallback(() => {
    ttsPlayer.unlockAudio(); // 确保用户点击时拥有播放上下文权限
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    if (ctrl.view.choices.length > 0) return;
    if (ctrl.view.pendingCommand?.name === 'say') {
      ttsPlayer.stop(); // 推进到下一句时停止当前语音
      ctrl.continueCommand();
    }
  }, []);

  // ── 键盘推进 ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!sheetOpen) advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, sheetOpen]);

  // ── 自动播放：需等待语音播放完毕；若玩家点击则立即跳过 ──
  useEffect(() => {
    if (!meta.settings.autoPlay || ffMode || !line || !canAdvance) return;

    // 若启用了语音且当前语音正在合成/播放中，则继续等待语音播放完毕再推进
    if (meta.settings.ttsEnabled && isSpeaking) {
      return;
    }

    // 语音播放完毕（或关闭语音）后，留出自然的缓冲间隔（默认 650ms，随文本速度微调）再推进下一句
    const bufferDelay = Math.max(350, 650 / Math.max(0.5, meta.settings.textSpeed));
    const timer = setTimeout(advance, bufferDelay);
    return () => clearTimeout(timer);
  }, [
    meta.settings.autoPlay,
    meta.settings.ttsEnabled,
    meta.settings.textSpeed,
    isSpeaking,
    ffMode,
    line,
    canAdvance,
    advance,
  ]);

  // ── 快进：仅跳过开场前已读过的文本 ──
  useEffect(() => {
    if (!ffMode || !line || !canAdvance) return;
    if (!startReadRef.current.has(line.speaker + line.text)) {
      setFfMode(false);
      return;
    }
    const timer = setTimeout(advance, 260);
    return () => clearTimeout(timer);
  }, [ffMode, line, canAdvance, advance]);

  // ── toast 自动消失 ──
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const commitReadTexts = useCallback(() => {
    const m = metaRef.current;
    const merged = Array.from(new Set([...m.readTexts, ...sessionReadRef.current]));
    if (merged.length !== m.readTexts.length) onMetaChange({ ...m, readTexts: merged });
  }, [onMetaChange]);

  const doSave = (slot: number) => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    const data: SaveData = {
      mark: markRef.current,
      memory: { ...(ctrl.view.snapshot.memory as SaveData['memory']) },
      backlog: backlogRef.current,
      savedAt: new Date().toISOString(),
      preview: line?.text ?? '',
      previewBg: BACKGROUNDS[bg] || '',
    };
    setToast(writeSlot(slot, data) ? `已保存到存档 ${slot + 1}` : '保存失败');
    setSheet(null);
  };

  const doLoad = (slot: number) => {
    const data = readSlot(slot, EMPTY_SAVE);
    if (!data) {
      setToast('存档不存在');
      setSheet(null);
      return;
    }
    try {
      unsubscribeRef.current?.();
      controllerRef.current?.stop();
      ttsPlayer.stop();
      const ctrl = new ScenarioController({ source: SCRIPT, memory: { ...data.memory } });
      controllerRef.current = ctrl;
      processedCmdRef.current = null;
      unsubscribeRef.current = ctrl.onChange(() => force());
      backlogRef.current = data.backlog;
      setLine(null);
      setEndingId(null);
      setFfMode(false);
      setSheet(null);
      setToast(`已读取存档 ${slot + 1}`);
      void ctrl.start(data.mark).catch(() => setToast('存档读取失败'));
    } catch {
      setToast('存档读取失败');
    }
  };

  const handleHome = () => {
    ttsPlayer.stop();
    commitReadTexts();
    onExit();
  };

  const handleNextBgm = () => {
    realBgmEngine.next();
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black select-none">
      {/* 背景场景 */}
      <img
        key={bg}
        src={BACKGROUNDS[bg]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: 'vn-fade-in 400ms linear both' }}
      />

      {/* 樱花飘落粒子与转场黑幕 */}
      <SakuraTransition isTransitioning={isTransitioning} enablePetals={true} />

      {/* 角色立绘展示（带眨眼微动与情绪呼吸动效） */}
      {(Object.entries(portraits) as Array<[PortraitSlot, PortraitId]>).map(([slot, id]) => (
        <AnimatedPortrait
          key={`${slot}-${id}`}
          id={id}
          slot={slot}
        />
      ))}

      {/* 回想模式标牌 */}
      {isRecallMode && (
        <div className="absolute left-4 top-3 z-40 flex items-center gap-2 border border-[#C34043] bg-[rgba(18,17,17,0.85)] px-4 py-1.5 text-xs tracking-[0.3em] text-[#C34043]">
          <span>事件回想模式</span>
        </div>
      )}

      {/* 顶部控制栏 */}
      <ControlBar
        ffActive={ffMode}
        autoActive={meta.settings.autoPlay}
        currentBgmTitle={currentBgmTitle}
        onNextBgm={handleNextBgm}
        onSave={() => setSheet('save')}
        onLoad={() => setSheet('load')}
        onToggleFf={() => setFfMode((v) => !v)}
        onToggleAuto={() =>
          onMetaChange({ ...meta, settings: { ...meta.settings, autoPlay: !meta.settings.autoPlay } })
        }
        onBacklog={() => setSheet('backlog')}
        onSettings={() => setSheet('settings')}
        onHome={handleHome}
      />

      {/* 逐字打字机对话框 */}
      {line && !choicesOpen && status === 'running' && (
        <TypewriterDialogBox
          speaker={line.speaker}
          text={line.text}
          canAdvance={canAdvance}
          onAdvance={advance}
          textSpeedMultiplier={meta.settings.textSpeed}
        />
      )}

      {/* 分支选项 */}
      {choicesOpen && (
        <ChoiceMenu
          options={choices.map((c) => c.text)}
          onChoose={(i) => controllerRef.current?.choose(i)}
        />
      )}

      {/* 回想结束面板 */}
      {isRecallMode && status === 'complete' && !endingId && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(10,9,9,0.8)] px-6"
          style={{ animation: 'vn-fade-in 400ms linear both' }}
        >
          <span className="mb-3 border border-[#C34043] px-3 py-1 text-xs tracking-[0.4em] text-[#C34043]">
            回想结束
          </span>
          <h2 className="mb-6 text-2xl tracking-[0.3em] text-[#E8E4DE]">此段故事已重温完毕</h2>
          <button
            type="button"
            onClick={handleHome}
            className="border border-[#43403D] px-8 py-2.5 text-sm tracking-[0.3em] text-[#E8E4DE] transition-colors hover:border-[#C34043] hover:text-[#C34043]"
          >
            返回收集殿堂
          </button>
        </div>
      )}

      {/* 面板 */}
      {sheet === 'save' && <SaveLoadSheet mode="save" onClose={() => setSheet(null)} onPick={doSave} />}
      {sheet === 'load' && <SaveLoadSheet mode="load" onClose={() => setSheet(null)} onPick={doLoad} />}
      {sheet === 'settings' && (
        <SettingsSheet
          settings={meta.settings}
          onChange={(settings) => onMetaChange({ ...meta, settings })}
          onClose={() => setSheet(null)}
          onDataImported={onMetaChange}
        />
      )}
      {sheet === 'backlog' && <BacklogSheet entries={backlogRef.current} onClose={() => setSheet(null)} />}

      {/* 提示 */}
      {toast && (
        <div
          className="absolute left-1/2 top-14 z-50 -translate-x-1/2 border border-[#43403D] px-6 py-2 text-xs tracking-[0.3em] text-[#E8E4DE]"
          style={{ backgroundColor: 'rgba(18, 17, 17, 0.92)' }}
        >
          {toast}
        </div>
      )}

      {/* 结局画面 */}
      {status === 'complete' && endingId && (
        <EndingOverlay endingId={endingId} onHome={handleHome} onRestart={onRestart} />
      )}
    </div>
  );
};

export default GameScreen;
