// 程序化 BGM 引擎：基于 Tone.js 合成四首氛围循环曲
// 避免外部音频链接失效问题，支持音量控制与曲目切换
import * as Tone from 'tone';

export type BgmTrack = 'daily' | 'sorrow' | 'quiet' | 'hope';

interface TrackDef {
  bpm: number;
  // [小节内拍点, 音符, 时值(秒)]
  notes: Array<[number, string, number]>;
  oscillator: OscillatorType;
  envelope: { attack: number; decay: number; sustain: number; release: number };
  lowpass: number;
  gain: number;
  loopSeconds: number;
}

// ヨナ抜き音阶（日本民谣五声音阶）营造日式物哀氛围
const TRACKS: Record<BgmTrack, TrackDef> = {
  // 日常：温暖明亮的 C 宫五声琶音
  daily: {
    bpm: 76,
    oscillator: 'triangle',
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 1.2 },
    lowpass: 3200,
    gain: 0.5,
    loopSeconds: 8,
    notes: [
      [0, 'C4', 0.5], [0.5, 'E4', 0.5], [1, 'G4', 0.5], [1.5, 'A4', 0.5],
      [2, 'G4', 0.5], [2.5, 'E4', 0.5], [3, 'D4', 1],
      [4, 'A3', 0.5], [4.5, 'C4', 0.5], [5, 'E4', 0.5], [5.5, 'G4', 0.5],
      [6, 'E4', 1], [7, 'D4', 1],
      [0, 'C3', 4], [4, 'A2', 4],
    ],
  },
  // 悲伤：A 羽调慢板，稀疏长音
  sorrow: {
    bpm: 56,
    oscillator: 'sine',
    envelope: { attack: 0.05, decay: 0.8, sustain: 0.3, release: 2.4 },
    lowpass: 2200,
    gain: 0.55,
    loopSeconds: 12,
    notes: [
      [0, 'A3', 2], [2, 'C4', 1.5], [3.5, 'E4', 2.5],
      [6, 'D4', 2], [8, 'C4', 1.5], [9.5, 'A3', 2.5],
      [0, 'A2', 6], [6, 'E2', 6],
      [4, 'G3', 1],
    ],
  },
  // 宁静：病房场景，极稀疏的单音
  quiet: {
    bpm: 50,
    oscillator: 'sine',
    envelope: { attack: 0.08, decay: 1, sustain: 0.2, release: 3 },
    lowpass: 1800,
    gain: 0.42,
    loopSeconds: 12,
    notes: [
      [0, 'E4', 3], [4, 'C4', 3], [8, 'A3', 4],
      [0, 'C3', 8],
    ],
  },
  // 希望：救赎结局，升调温暖琶音
  hope: {
    bpm: 66,
    oscillator: 'triangle',
    envelope: { attack: 0.02, decay: 0.6, sustain: 0.25, release: 1.8 },
    lowpass: 2800,
    gain: 0.5,
    loopSeconds: 12,
    notes: [
      [0, 'A3', 0.75], [0.75, 'C4', 0.75], [1.5, 'E4', 0.75], [2.25, 'A4', 1.5],
      [4, 'G4', 0.75], [4.75, 'E4', 0.75], [5.5, 'D4', 1.5],
      [7, 'C4', 0.75], [7.75, 'E4', 0.75], [8.5, 'G4', 1.5],
      [10, 'A4', 2],
      [0, 'A2', 4], [4, 'G2', 3], [7, 'C3', 5],
    ],
  },
};

class BgmEngine {
  private synth: Tone.PolySynth | null = null;
  private gainNode: Tone.Gain | null = null;
  private part: Tone.Part | null = null;
  private current: BgmTrack | null = null;
  private volume = 0.7;
  private started = false;

  /** 必须在用户手势后调用（浏览器自动播放策略） */
  async init(): Promise<void> {
    if (this.started) return;
    await Tone.start();
    this.gainNode = new Tone.Gain(this.volume);
    const reverb = new Tone.Reverb({ decay: 4, wet: 0.35 });
    this.gainNode.connect(reverb);
    reverb.toDestination();
    this.synth = new Tone.PolySynth(Tone.Synth).connect(this.gainNode);
    this.started = true;
    if (this.current) void this.play(this.current);
  }

  get isReady(): boolean {
    return this.started;
  }

  async play(track: BgmTrack): Promise<void> {
    this.current = track;
    if (!this.started || !this.synth || !this.gainNode) return;
    this.stopPart();
    const def = TRACKS[track];
    Tone.Transport.bpm.value = def.bpm;
    this.synth.set({
      oscillator: { type: def.oscillator },
      envelope: def.envelope,
    });
    this.synth.set({ volume: Tone.gainToDb(def.gain) });
    const filter = new Tone.Filter(def.lowpass, 'lowpass');
    this.synth.disconnect();
    this.synth.chain(filter, this.gainNode);
    const synth = this.synth;
    const events = def.notes.map(
      ([at, note, dur]): [number, { note: string; dur: number }] => [at, { note, dur }],
    );
    this.part = new Tone.Part((time: number, value: { note: string; dur: number }) => {
      synth.triggerAttackRelease(value.note, value.dur, time);
    }, events);
    this.part.loop = true;
    this.part.loopEnd = def.loopSeconds;
    this.part.start(0);
    if (Tone.Transport.state !== 'started') Tone.Transport.start();
  }

  stop(): void {
    this.current = null;
    this.stopPart();
  }

  private stopPart(): void {
    if (this.part) {
      this.part.stop();
      this.part.dispose();
      this.part = null;
    }
    this.synth?.releaseAll();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    this.gainNode?.gain.rampTo(this.volume, 0.1);
  }

  getVolume(): number {
    return this.volume;
  }
}

export const bgmEngine = new BgmEngine();
