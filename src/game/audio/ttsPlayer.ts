// 前端台词语音播放管理器
// 1. 完全基于随源码提供的本地静态 MP3 音频（同一位女声，无男声旁白）
// 2. 运行时零网络请求，纯本地静态资源播放
// 3. 支持自动打断上一句语音播放
// 4. 支持全局语音音量控制与静音开关
// 5. 状态订阅：支持外部监听语音是否正在播放（isSpeaking），以便自动播放等待语音完毕

import voiceManifest from './voiceManifest.json';

// 语音文件统一放在 public/audio/voices/ 下，随构建产物一起发布
const VOICE_BASE = `${import.meta.env.BASE_URL}audio/voices/`;

function resolveVoiceUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${VOICE_BASE}${path}`;
}

interface TTSOptions {
  speaker?: string;
  label?: string;
}

type StateListener = (isSpeaking: boolean) => void;

class TTSManager {
  private currentAudio: HTMLAudioElement | null = null;
  private volume = 1.0;
  private enabled = true;
  private speaking = false;
  private listeners = new Set<StateListener>();
  private activeSpeakId = 0;
  private audioUnlocked = false;

  // 映射表
  private byText: Record<string, string> = voiceManifest.by_text || {};
  private byLabel: Record<string, string> = voiceManifest.by_label || {};

  /**
   * 解锁浏览器音频策略（在用户首次点击开始游戏或点击屏幕时调用）
   */
  public unlockAudio() {
    if (this.audioUnlocked) return;
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silentAudio.volume = 0;
      silentAudio.play().then(() => {
        this.audioUnlocked = true;
      }).catch(() => {
        // 等待下次点击
      });
    } catch {
      // ignore
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (!enable) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.speaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setSpeaking(status: boolean) {
    if (this.speaking !== status) {
      this.speaking = status;
      this.listeners.forEach((fn) => {
        try {
          fn(status);
        } catch {
          // ignore listener errors
        }
      });
    }
  }

  public stop() {
    this.activeSpeakId += 1;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.setSpeaking(false);
  }

  /**
   * 查找台词对应的本地静态 MP3 音频 URL
   */
  public getVoiceUrl(text: string, options: TTSOptions = {}): string | null {
    const speaker = options.speaker ?? '旁白';
    const cleanText = text
      .trim()
      .replace(/[「」『』"]/g, '');

    // 1. 精确匹配说话人+清洗后文本
    const key = `${speaker}_${cleanText}`;
    if (this.byText[key]) {
      return resolveVoiceUrl(this.byText[key]);
    }

    // 2. 检查 label 匹配
    if (options.label && this.byLabel[options.label]) {
      return resolveVoiceUrl(this.byLabel[options.label]);
    }

    // 3. 尝试模糊文本匹配
    for (const [k, url] of Object.entries(this.byText)) {
      if (k.endsWith(`_${cleanText}`)) {
        return resolveVoiceUrl(url);
      }
    }

    return null;
  }

  /**
   * 同步播放指定说话人与对话文本的本地静态 MP3 语音
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.enabled) {
      this.setSpeaking(false);
      return;
    }

    // 立即停止上一句的播放
    this.stop();
    const currentId = ++this.activeSpeakId;

    const audioUrl = this.getVoiceUrl(text, options);
    if (!audioUrl) {
      // 若无对应音频，不阻塞游戏逻辑
      this.setSpeaking(false);
      return;
    }

    this.setSpeaking(true);

    try {
      const audio = new Audio(audioUrl);
      audio.volume = this.volume;
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.activeSpeakId === currentId) {
          this.currentAudio = null;
          this.setSpeaking(false);
        }
      };

      audio.onerror = () => {
        if (this.activeSpeakId === currentId) {
          this.currentAudio = null;
          this.setSpeaking(false);
        }
      };

      await audio.play();
    } catch {
      if (this.activeSpeakId === currentId) {
        this.currentAudio = null;
        this.setSpeaking(false);
      }
    }
  }
}

export const ttsPlayer = new TTSManager();
