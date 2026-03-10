// Port of Flutter TranscodingService — uses localStorage for persistence

export const TranscodeBitrate = {
  original: 0,
  kbps64: 64,
  kbps128: 128,
  kbps192: 192,
  kbps256: 256,
  kbps320: 320,
  options: [0, 64, 128, 192, 256, 320] as const,
  getLabel(bitrate: number): string {
    return bitrate === 0 ? "Original (No Transcoding)" : `${bitrate} kbps`;
  },
} as const;

export const TranscodeFormat = {
  original: "raw",
  mp3: "mp3",
  opus: "opus",
  aac: "aac",
  options: ["raw", "mp3", "opus", "aac"] as const,
  getLabel(format: string): string {
    switch (format) {
      case "raw": return "Original";
      case "mp3": return "MP3";
      case "opus": return "Opus";
      case "aac": return "AAC";
      default: return format.toUpperCase();
    }
  },
} as const;

const KEYS = {
  bitrate: "transcoding_bitrate",
  format: "transcoding_format",
  enabled: "transcoding_enabled",
} as const;

type Listener = () => void;

class TranscodingServiceClass {
  private _bitrate: number;
  private _format: string;
  private _enabled: boolean;

  private _listeners: Set<Listener> = new Set();

  constructor() {
    this._bitrate = this._load(KEYS.bitrate, TranscodeBitrate.original);
    this._format = this._loadStr(KEYS.format, TranscodeFormat.mp3);
    this._enabled = this._loadBool(KEYS.enabled, false);
  }

  // --- Getters ---
  get bitrate(): number { return this._bitrate; }
  get format(): string { return this._format; }
  get enabled(): boolean { return this._enabled; }

  // --- Subscribe/Unsubscribe ---
  subscribe(fn: Listener): () => void {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  private _notify() {
    this._listeners.forEach((fn) => fn());
  }

  // --- Setters ---
  setEnabled(value: boolean) {
    this._enabled = value;
    localStorage.setItem(KEYS.enabled, String(value));
    this._notify();
  }

  setBitrate(bitrate: number) {
    this._bitrate = bitrate;
    localStorage.setItem(KEYS.bitrate, String(bitrate));
    this._notify();
  }

  setFormat(format: string) {
    this._format = format;
    localStorage.setItem(KEYS.format, format);
    this._notify();
  }

  // --- Computed ---
  getCurrentBitrate(): number | null {
    if (!this._enabled) return null;
    return this._bitrate === TranscodeBitrate.original ? null : this._bitrate;
  }

  getCurrentFormat(): string | null {
    if (!this._enabled) return null;
    return this._format === TranscodeFormat.original ? null : this._format;
  }

  dispose() {
    this._listeners.clear();
  }

  // --- Storage helpers ---
  private _load(key: string, fallback: number): number {
    const v = localStorage.getItem(key);
    return v !== null ? parseInt(v, 10) : fallback;
  }
  private _loadStr(key: string, fallback: string): string {
    return localStorage.getItem(key) ?? fallback;
  }
  private _loadBool(key: string, fallback: boolean): boolean {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : fallback;
  }
}

// Singleton (mirrors Flutter's provider-style singleton)
export const transcodingService = new TranscodingServiceClass();
