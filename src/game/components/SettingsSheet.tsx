// 设置面板：BGM 音量 / 角色语音 / 自动播放 / 文本速度 + 本地数据导出导入 + 开源仓库入口
import { useRef, useState, type ChangeEvent, type FC } from 'react';
import { X, Volume2, Download, Upload, Github } from 'lucide-react';
import {
  exportSaveArchive,
  importSaveArchive,
  loadMeta,
  SLOT_COUNT,
  savedSlotCount,
  storageBackend,
  type MetaState,
  type Settings,
} from '../store';

interface SettingsSheetProps {
  settings: Settings;
  onChange: (next: Settings) => void;
  onClose: () => void;
  /** 打开「开源仓库」弹窗 */
  onOpenSource?: () => void;
  /** 导入备份成功后的回调，用于刷新收集进度等界面状态 */
  onDataImported?: (meta: MetaState) => void;
}

const BACKEND_LABEL: Record<string, string> = {
  indexeddb: 'IndexedDB 本地数据库',
  localstorage: 'localStorage（浏览器降级模式）',
  memory: '内存（当次会话）',
};

const SettingsSheet: FC<SettingsSheetProps> = ({
  settings,
  onChange,
  onClose,
  onOpenSource,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const fileName = await exportSaveArchive();
      setDataMessage(`已导出 ${fileName}`);
    } catch {
      setDataMessage('导出失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const result = await importSaveArchive(await file.text());
      if (result.ok) {
        const meta = loadMeta();
        onDataImported?.(meta);
        setDataMessage(`已导入 ${result.slots} 个槽位的存档数据`);
      } else {
        setDataMessage(result.error);
      }
    } catch {
      setDataMessage('导入失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 9, 9, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="max-h-[92%] w-[88%] max-w-[480px] overflow-y-auto border border-[#43403D] bg-[#181716] p-6"
        style={{ animation: 'vn-sheet-in 150ms linear both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm tracking-[0.4em] text-[#E8E4DE]">设置</h2>
          <button type="button" onClick={onClose} className="text-[#76736E] hover:text-[#C34043]">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* 角色配音 (TTS) 控制 */}
          <div className="border border-[#32302E] bg-[rgba(24,23,22,0.6)] p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs tracking-[0.25em] text-[#E8E4DE]">
                <Volume2 className="h-3.5 w-3.5 text-[#C34043]" />
                角色语音配音 (TTS)
              </span>
              <button
                type="button"
                onClick={() => onChange({ ...settings, ttsEnabled: !settings.ttsEnabled })}
                className="border border-[#43403D] px-3 py-0.5 text-xs tracking-[0.2em]"
                style={{
                  color: settings.ttsEnabled ? '#D08C4A' : '#76736E',
                  borderColor: settings.ttsEnabled ? '#D08C4A' : '#43403D',
                }}
              >
                {settings.ttsEnabled ? '开启' : '关闭'}
              </button>
            </div>
            {settings.ttsEnabled && (
              <label className="block">
                <span className="mb-1 block text-[11px] tracking-[0.2em] text-[#A9A49C]">
                  语音音量 · {Math.round(settings.ttsVolume * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(settings.ttsVolume * 100)}
                  onChange={(e) => onChange({ ...settings, ttsVolume: Number(e.target.value) / 100 })}
                  className="w-full accent-[#C34043]"
                />
              </label>
            )}
          </div>

          {/* BGM 音量 */}
          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.3em] text-[#A9A49C]">
              BGM 音量 · {Math.round(settings.bgmVolume * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.bgmVolume * 100)}
              onChange={(e) => onChange({ ...settings, bgmVolume: Number(e.target.value) / 100 })}
              className="w-full accent-[#C34043]"
            />
          </label>

          {/* 自动播放 */}
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-[0.3em] text-[#A9A49C]">自动播放</span>
            <button
              type="button"
              onClick={() => onChange({ ...settings, autoPlay: !settings.autoPlay })}
              className="border border-[#43403D] px-4 py-1 text-xs tracking-[0.2em]"
              style={{
                color: settings.autoPlay ? '#D08C4A' : '#76736E',
                borderColor: settings.autoPlay ? '#D08C4A' : '#43403D',
              }}
            >
              {settings.autoPlay ? '开' : '关'}
            </button>
          </div>

          {/* 文本速度 */}
          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.3em] text-[#A9A49C]">
              文本速度 · {settings.textSpeed.toFixed(1)}x
            </span>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={Math.round(settings.textSpeed * 10)}
              onChange={(e) => onChange({ ...settings, textSpeed: Number(e.target.value) / 10 })}
              className="w-full accent-[#C34043]"
            />
            <span className="mt-1 block text-[10px] text-[#76736E]">影响逐字打字与自动播放推进节奏</span>
          </label>

          {/* 本地数据备份 */}
          <div className="mt-2 border-t border-[#33302E] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="block text-xs tracking-[0.2em] text-[#E8E4DE]">存档数据</span>
                <span className="text-[10px] text-[#76736E]">
                  {savedSlotCount()} / {SLOT_COUNT} 个槽位 · 保存在{BACKEND_LABEL[storageBackend()] ?? '浏览器本地'}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleExport}
                  className="flex items-center gap-1 border border-[#43403D] bg-[#22201F] px-3 py-1.5 text-xs tracking-[0.15em] text-[#E8E4DE] transition-colors hover:border-[#D8697A] hover:bg-[#D8697A] disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>导出</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 border border-[#43403D] bg-[#22201F] px-3 py-1.5 text-xs tracking-[0.15em] text-[#E8E4DE] transition-colors hover:border-[#D8697A] hover:bg-[#D8697A] disabled:opacity-40"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>导入</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </div>
            {dataMessage && (
              <p className="mt-2 text-[10px] tracking-[0.1em] text-[#D8697A]">{dataMessage}</p>
            )}
            <p className="mt-1 text-[10px] leading-relaxed text-[#76736E]">
              导出为 JSON 备份文件（含存档、收集进度与设置）；导入会覆盖同槽位数据。
            </p>
          </div>

          {/* 开源仓库 */}
          {onOpenSource && (
            <div className="border-t border-[#33302E] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs tracking-[0.2em] text-[#E8E4DE]">开源仓库</span>
                  <span className="text-[10px] text-[#76736E]">查看完整前端源码与剧本，自由二次创作</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenSource}
                  className="flex items-center gap-1.5 border border-[#43403D] bg-[#22201F] px-3.5 py-1.5 text-xs tracking-[0.2em] text-[#E8E4DE] transition-colors hover:border-[#D8697A] hover:bg-[#D8697A]"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>打开</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSheet;
