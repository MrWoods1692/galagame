// 存档、进度与设置的持久化层
// 全部数据写入浏览器本地数据库（IndexedDB），不依赖任何后端服务；
// 启动时一次性载入内存镜像，因此游戏逻辑仍可用同步 API 读写，落盘在后台完成。
// 同时提供整站数据的导出 / 导入（JSON 备份），方便换机或备份进度。
import {
  dbClear,
  dbGetAll,
  dbRemove,
  dbSet,
  initLocalDb,
  type LocalDbBackend,
} from '../db/localDb';

export interface BacklogEntry {
  speaker: string;
  text: string;
}

export interface SaveData {
  mark: string;
  memory: Record<string, number | string | boolean | null>;
  backlog: BacklogEntry[];
  savedAt: string;
  preview: string;
  previewBg?: string; // 场景缩略图标识或 URL
}

export interface Settings {
  bgmVolume: number;
  ttsVolume: number;
  ttsEnabled: boolean;
  autoPlay: boolean;
  textSpeed: number; // 自动播放节奏系数 0.5 ~ 2
}

export interface MetaState {
  endings: string[];
  unlockedEvents: string[];
  unlockedCGs?: string[];
  readTexts: string[];
  settings: Settings;
}

const SLOT_PREFIX = 'sakura_vn_slot_';
const META_KEY = 'sakura_vn_meta';
const SAVE_CHUNK_ID = 'vn-progress';
const SAVE_VERSION = 1;
const GAME_VERSION = '1.0.0';
const ARCHIVE_FORMAT = 'galagame-save-archive';
const ARCHIVE_VERSION = 1;

export const SLOT_COUNT = 6;

/** 版本化存档信封：与历史版本保持一致，旧的 localStorage 存档可直接读入 */
interface SaveEnvelope {
  gameVersion: string;
  createdAt: string;
  chunks: Record<string, { id: string; version: number; data: SaveData }>;
}

export interface SaveArchive {
  format: typeof ARCHIVE_FORMAT;
  version: number;
  exportedAt: string;
  meta: MetaState;
  slots: Record<string, SaveEnvelope>;
}

// ── 内存镜像（同步读写）与后台落盘 ──
const memory = new Map<string, unknown>();
let pendingWrites: Promise<unknown> = Promise.resolve();
let backend: LocalDbBackend = 'memory';
let hydrated = false;

function enqueue(task: () => Promise<unknown>): void {
  pendingWrites = pendingWrites.then(task).catch(() => {
    // 落盘失败不阻塞游戏进行
  });
}

function persist(key: string, value: unknown): void {
  memory.set(key, value);
  enqueue(() => dbSet(key, value));
}

function drop(key: string): void {
  memory.delete(key);
  enqueue(() => dbRemove(key));
}

/**
 * 启动时调用：打开本地数据库并把全部数据载入内存镜像。
 * 若检测到旧版本遗留在 localStorage 中的存档，会自动迁移进本地数据库。
 */
export async function hydrateStore(): Promise<void> {
  if (hydrated) return;
  backend = await initLocalDb();
  const all = await dbGetAll();
  for (const [key, value] of Object.entries(all)) memory.set(key, value);
  hydrated = true;
  await migrateLegacyLocalStorage();
}

async function migrateLegacyLocalStorage(): Promise<void> {
  if (backend !== 'indexeddb' || typeof localStorage === 'undefined') return;
  const legacyKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key === META_KEY || key.startsWith(SLOT_PREFIX)) legacyKeys.push(key);
  }
  for (const key of legacyKeys) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    if (!memory.has(key)) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        persist(key, parsed);
      } catch {
        // 忽略损坏的历史数据
      }
    }
    localStorage.removeItem(key);
  }
  await flushStore();
}

/** 等待所有排队中的落盘任务完成（导出备份前调用） */
export async function flushStore(): Promise<void> {
  await pendingWrites;
}

/** 当前实际使用的本地存储后端 */
export function storageBackend(): LocalDbBackend {
  return backend;
}

// ── 存档信封编解码 ──
function encodeSlot(data: SaveData): SaveEnvelope {
  return {
    gameVersion: GAME_VERSION,
    createdAt: data.savedAt,
    chunks: {
      [SAVE_CHUNK_ID]: { id: SAVE_CHUNK_ID, version: SAVE_VERSION, data },
    },
  };
}

function decodeSlot(raw: unknown): SaveData | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const envelope = raw as { chunks?: Record<string, { data?: unknown }> };
  const data = envelope.chunks?.[SAVE_CHUNK_ID]?.data;
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.mark !== 'string' || typeof d.memory !== 'object' || d.memory === null) return null;
  if (!Array.isArray(d.backlog)) return null;
  return data as SaveData;
}

function slotKey(slot: number): string {
  return SLOT_PREFIX + slot;
}

// ── 槽位读写 ──
export function writeSlot(slot: number, data: SaveData): boolean {
  try {
    persist(slotKey(slot), encodeSlot(data));
    return true;
  } catch {
    return false;
  }
}

export function readSlot(slot: number, _fallback?: SaveData): SaveData | null {
  return decodeSlot(memory.get(slotKey(slot)));
}

export function clearSlot(slot: number): void {
  drop(slotKey(slot));
}

export function slotSummary(slot: number): { savedAt: string; preview: string; previewBg?: string } | null {
  const data = decodeSlot(memory.get(slotKey(slot)));
  if (!data || typeof data.savedAt !== 'string') return null;
  return {
    savedAt: data.savedAt,
    preview: typeof data.preview === 'string' ? data.preview : '',
    previewBg: typeof data.previewBg === 'string' ? data.previewBg : undefined,
  };
}

export function savedSlotCount(): number {
  let count = 0;
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    if (memory.has(slotKey(i))) count += 1;
  }
  return count;
}

// ── 收集进度与设置 ──
const DEFAULT_META: MetaState = {
  endings: [],
  unlockedEvents: [],
  unlockedCGs: ['cg_classroom_sunset'], // 默认解锁序章CG
  readTexts: [],
  settings: { bgmVolume: 0.7, ttsVolume: 1.0, ttsEnabled: true, autoPlay: false, textSpeed: 1 },
};

function normalizeMeta(raw: unknown): MetaState {
  const meta = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<MetaState>;
  const settings = { ...DEFAULT_META.settings, ...meta.settings };
  // 兼容历史存档缺少 ttsEnabled / ttsVolume 的情况，确保默认开启
  if (typeof settings.ttsEnabled !== 'boolean') settings.ttsEnabled = true;
  if (typeof settings.ttsVolume !== 'number') settings.ttsVolume = 1.0;
  return {
    endings: Array.isArray(meta.endings) ? meta.endings : [],
    unlockedEvents: Array.isArray(meta.unlockedEvents) ? meta.unlockedEvents : [],
    unlockedCGs: Array.isArray(meta.unlockedCGs) ? meta.unlockedCGs : ['cg_classroom_sunset'],
    readTexts: Array.isArray(meta.readTexts) ? meta.readTexts : [],
    settings,
  };
}

export function loadMeta(): MetaState {
  return normalizeMeta(memory.get(META_KEY));
}

export function saveMeta(meta: MetaState): void {
  persist(META_KEY, meta);
}

export function hasAnySave(): boolean {
  return savedSlotCount() > 0;
}

// ── 数据导出 / 导入 ──
export function buildArchive(): SaveArchive {
  const slots: Record<string, SaveEnvelope> = {};
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    const raw = memory.get(slotKey(i));
    if (raw) slots[String(i)] = raw as SaveEnvelope;
  }
  return {
    format: ARCHIVE_FORMAT,
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    meta: loadMeta(),
    slots,
  };
}

function archiveFileName(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `galagame-save-${stamp}.json`;
}

/** 导出全部本地数据（存档 + 收集进度 + 设置）为 JSON 文件并触发下载 */
export async function exportSaveArchive(): Promise<string> {
  await flushStore();
  const archive = buildArchive();
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = archiveFileName();
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return anchor.download;
}

export type ImportResult =
  | { ok: true; slots: number; meta: MetaState }
  | { ok: false; error: string };

/** 从导出的 JSON 备份文件恢复数据（覆盖同槽位存档与收集进度） */
export async function importSaveArchive(rawText: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: '文件不是合法的 JSON 备份' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: '备份内容格式错误' };
  }
  const archive = parsed as Partial<SaveArchive>;
  if (archive.format !== ARCHIVE_FORMAT) {
    return { ok: false, error: '不是本作的存档备份文件' };
  }
  if (typeof archive.version !== 'number' || archive.version > ARCHIVE_VERSION) {
    return { ok: false, error: '备份版本过新，无法导入' };
  }

  let imported = 0;
  const slots = archive.slots ?? {};
  for (const [key, envelope] of Object.entries(slots)) {
    const slot = Number(key);
    if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) continue;
    if (!decodeSlot(envelope)) continue;
    persist(slotKey(slot), envelope);
    imported += 1;
  }

  const meta = normalizeMeta(archive.meta);
  saveMeta(meta);
  await flushStore();
  return { ok: true, slots: imported, meta };
}

/** 清空本地数据库中的全部游戏数据 */
export async function clearAllData(): Promise<void> {
  memory.clear();
  await dbClear();
}
