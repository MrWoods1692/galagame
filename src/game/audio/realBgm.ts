// BGM 引擎：全部由浏览器本地实时合成（Tone.js），工程内不含任何音频文件或外部音频请求。
// 支持按剧情切换曲风、随机切歌、音量调节与状态订阅。
import { bgmEngine, type BgmTrack } from './bgm';

export interface BgmTrackInfo {
  id: string;
  title: string;
  mood: BgmTrack;
}

const PLAYLIST: BgmTrackInfo[] = [
  { id: 'track1', title: '樱落时节', mood: 'daily' },
  { id: 'track2', title: '樱落时分', mood: 'sorrow' },
  { id: 'track3', title: '病房的午后', mood: 'quiet' },
  { id: 'track4', title: '来年的春天', mood: 'hope' },
];

export class RealBgmEngine {
  private currentIndex: number;
  private volume = 0.7;
  private isPlaying = false;
  private listeners: Array<() => void> = [];

  constructor() {
    // 默认从随机一首开始
    this.currentIndex = Math.floor(Math.random() * PLAYLIST.length);
  }

  /** 首次用户交互后启动音频上下文（浏览器自动播放策略要求） */
  public async init(): Promise<void> {
    try {
      await bgmEngine.init();
      bgmEngine.setVolume(this.volume);
      this.isPlaying = true;
      await this.playCurrent();
    } catch {
      // 音频不可用时静默降级，不影响游戏运行
    }
    this.notify();
  }

  /** 按剧情需要的曲风播放（对应剧本中的 bgm 命令） */
  public playMood(mood: string): void {
    const index = PLAYLIST.findIndex((track) => track.mood === mood);
    this.currentIndex = index >= 0 ? index : 0;
    void this.playCurrent().then(() => this.notify());
  }

  public async play(): Promise<void> {
    this.isPlaying = true;
    await this.playCurrent();
    this.notify();
  }

  public pause(): void {
    this.isPlaying = false;
    bgmEngine.stop();
    this.notify();
  }

  public stop(): void {
    this.pause();
  }

  public next(): void {
    if (PLAYLIST.length > 1) {
      let nextIndex = Math.floor(Math.random() * PLAYLIST.length);
      if (nextIndex === this.currentIndex) {
        nextIndex = (this.currentIndex + 1) % PLAYLIST.length;
      }
      this.currentIndex = nextIndex;
    }
    void this.playCurrent().then(() => this.notify());
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    bgmEngine.setVolume(this.volume);
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): BgmTrackInfo {
    return PLAYLIST[this.currentIndex] ?? PLAYLIST[0];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== cb);
    };
  }

  private async playCurrent(): Promise<void> {
    if (!this.isPlaying) return;
    try {
      await bgmEngine.play(this.getCurrentTrack().mood);
    } catch {
      // 忽略音频异常
    }
  }

  private notify(): void {
    for (const cb of this.listeners) {
      try {
        cb();
      } catch {
        // ignore
      }
    }
  }
}

export const realBgmEngine = new RealBgmEngine();
