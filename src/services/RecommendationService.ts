import type { Song } from "./subsonic";

const DATA_KEY = "rec_data_v2";
const SKIP_KEY = "rec_skips";
const TIME_KEY = "rec_time";
const ENABLED_KEY = "recommendations_enabled";

export interface SongProfileData {
  songId: string;
  title: string;
  artist?: string;
  artistId?: string;
  albumId?: string;
  genre?: string;
  duration?: number;
  playCount: number;
  skipCount: number;
  totalListenTime: number;
  completedPlays: number;
  hourlyPlays: Record<string, number>;
  lastPlayed: number;
}

export class SongProfile {
  songId: string;
  title: string;
  artist?: string;
  artistId?: string;
  albumId?: string;
  genre?: string;
  duration?: number;

  playCount = 0;
  skipCount = 0;
  totalListenTime = 0;
  completedPlays = 0;
  hourlyPlays: Record<number, number> = {};
  lastPlayed: Date = new Date();

  constructor(data: {
    songId: string;
    title: string;
    artist?: string;
    artistId?: string;
    albumId?: string;
    genre?: string;
    duration?: number;
  }) {
    this.songId = data.songId;
    this.title = data.title;
    this.artist = data.artist;
    this.artistId = data.artistId;
    this.albumId = data.albumId;
    this.genre = data.genre;
    this.duration = data.duration;
  }

  addPlay(durationPlayed = 0, completed = false, hour?: number) {
    this.playCount++;
    this.totalListenTime += durationPlayed;
    if (completed) this.completedPlays++;
    if (hour !== undefined) {
      this.hourlyPlays[hour] = (this.hourlyPlays[hour] ?? 0) + 1;
    }
    this.lastPlayed = new Date();
  }

  get completionRate(): number {
    if (this.playCount === 0) return 0;
    return this.completedPlays / this.playCount;
  }

  getHourPreference(hour: number): number {
    const vals = Object.values(this.hourlyPlays);
    if (vals.length === 0) return 0;
    const maxH = Math.max(...vals);
    return (this.hourlyPlays[hour] ?? 0) / maxH;
  }

  toJson(): SongProfileData {
    return {
      songId: this.songId,
      title: this.title,
      artist: this.artist,
      artistId: this.artistId,
      albumId: this.albumId,
      genre: this.genre,
      duration: this.duration,
      playCount: this.playCount,
      skipCount: this.skipCount,
      totalListenTime: this.totalListenTime,
      completedPlays: this.completedPlays,
      hourlyPlays: { ...this.hourlyPlays },
      lastPlayed: this.lastPlayed.getTime(),
    };
  }

  static fromJson(data: SongProfileData): SongProfile {
    const p = new SongProfile(data);
    p.playCount = data.playCount ?? 0;
    p.skipCount = data.skipCount ?? 0;
    p.totalListenTime = data.totalListenTime ?? 0;
    p.completedPlays = data.completedPlays ?? 0;
    p.hourlyPlays = Object.fromEntries(
      Object.entries(data.hourlyPlays ?? {}).map(([k, v]) => [parseInt(k), v as number])
    );
    p.lastPlayed = data.lastPlayed ? new Date(data.lastPlayed) : new Date();
    return p;
  }
}

class RecommendationService {
  private _enabled = true;
  private _profiles = new Map<string, SongProfile>();
  private _artistAffinity = new Map<string, number>();
  private _genreAffinity = new Map<string, number>();
  private _skipCounts = new Map<string, number>();
  private _timePatterns = new Map<number, Map<string, number>>();
  private _recentlyPlayed: string[] = [];
  private _initialized = false;

  get enabled() { return this._enabled; }
  get initialized() { return this._initialized; }

  initialize(): void {
    if (this._initialized) return;
    try {
      this._enabled = localStorage.getItem(ENABLED_KEY) !== "false";

      const dataJson = localStorage.getItem(DATA_KEY);
      if (dataJson) {
        const data = JSON.parse(dataJson);
        if (data.profiles) {
          for (const [k, v] of Object.entries(data.profiles)) {
            this._profiles.set(k, SongProfile.fromJson(v as SongProfileData));
          }
        }
        if (data.artists) {
          for (const [k, v] of Object.entries(data.artists)) {
            this._artistAffinity.set(k, v as number);
          }
        }
        if (data.genres) {
          for (const [k, v] of Object.entries(data.genres)) {
            this._genreAffinity.set(k, v as number);
          }
        }
        if (data.recent) {
          this._recentlyPlayed = data.recent;
        }
      }

      const skipJson = localStorage.getItem(SKIP_KEY);
      if (skipJson) {
        const skips = JSON.parse(skipJson);
        for (const [k, v] of Object.entries(skips)) {
          this._skipCounts.set(k, v as number);
        }
      }

      const timeJson = localStorage.getItem(TIME_KEY);
      if (timeJson) {
        const timeData = JSON.parse(timeJson);
        for (const [k, v] of Object.entries(timeData)) {
          const hourMap = new Map<string, number>();
          for (const [genre, count] of Object.entries(v as Record<string, number>)) {
            hourMap.set(genre, count);
          }
          this._timePatterns.set(parseInt(k), hourMap);
        }
      }
    } catch (e) {
      console.error("Error loading recommendation data:", e);
    }
    this._initialized = true;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    localStorage.setItem(ENABLED_KEY, String(enabled));
  }

  trackSongPlay(song: Song, durationPlayed = 0, completed = false): void {
    if (!this._enabled) return;
    const hour = new Date().getHours();

    const existing = this._profiles.get(song.id);
    if (existing) {
      existing.addPlay(durationPlayed, completed, hour);
    } else {
      const profile = new SongProfile({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        artistId: song.artistId,
        albumId: song.albumId,
        genre: song.genre,
        duration: song.duration,
      });
      profile.addPlay(durationPlayed, completed, hour);
      this._profiles.set(song.id, profile);
    }

    this._recentlyPlayed = this._recentlyPlayed.filter(id => id !== song.id);
    this._recentlyPlayed.unshift(song.id);
    if (this._recentlyPlayed.length > 500) {
      this._recentlyPlayed = this._recentlyPlayed.slice(0, 500);
    }

    if (song.artist) {
      const w = completed ? 1.5 : 0.8;
      this._artistAffinity.set(song.artist, (this._artistAffinity.get(song.artist) ?? 0) + w);
    }
    if (song.genre) {
      const w = completed ? 1.2 : 0.6;
      this._genreAffinity.set(song.genre, (this._genreAffinity.get(song.genre) ?? 0) + w);
    }

    if (!this._timePatterns.has(hour)) this._timePatterns.set(hour, new Map());
    if (song.genre) {
      const hm = this._timePatterns.get(hour)!;
      hm.set(song.genre, (hm.get(song.genre) ?? 0) + 1);
    }

    this._saveData();
  }

  trackSkip(song: Song): void {
    if (!this._enabled) return;
    this._skipCounts.set(song.id, (this._skipCounts.get(song.id) ?? 0) + 1);
    if (song.artist) {
      this._artistAffinity.set(song.artist, (this._artistAffinity.get(song.artist) ?? 0) - 0.3);
    }
    const profile = this._profiles.get(song.id);
    if (profile) profile.skipCount++;
    this._saveData();
  }

  calculateSongScore(song: Song, currentHour?: number): number {
    if (!this._enabled) return 0.5;
    let score = 0.5;
    const profile = this._profiles.get(song.id);
    const hour = currentHour ?? new Date().getHours();

    if (this._artistAffinity.size > 0 && song.artist) {
      const maxA = Math.max(...this._artistAffinity.values());
      if (maxA > 0) score += ((this._artistAffinity.get(song.artist) ?? 0) / maxA) * 0.35;
    }

    if (this._genreAffinity.size > 0 && song.genre) {
      const maxG = Math.max(...this._genreAffinity.values());
      if (maxG > 0) score += ((this._genreAffinity.get(song.genre) ?? 0) / maxG) * 0.25;
    }

    if (profile) {
      score += profile.completionRate * 0.15;
      score += profile.getHourPreference(hour) * 0.1;
      if (profile.playCount > 0) score += Math.min(profile.playCount / 10.0, 1.0) * 0.1;
    }

    const skips = this._skipCounts.get(song.id) ?? 0;
    if (skips > 0) score -= Math.min(skips * 0.05, 0.3);

    const recentIdx = this._recentlyPlayed.indexOf(song.id);
    if (recentIdx >= 0 && recentIdx < 20) score -= (20 - recentIdx) * 0.015;

    const hourPatterns = this._timePatterns.get(hour);
    if (hourPatterns && song.genre && hourPatterns.size > 0) {
      const maxHg = Math.max(...hourPatterns.values());
      if (maxHg > 0) score += ((hourPatterns.get(song.genre) ?? 0) / maxHg) * 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }

  getPersonalizedFeed(allSongs: Song[], limit = 50): Song[] {
    if (!this._enabled || allSongs.length === 0) return allSongs.slice(0, limit);
    const hour = new Date().getHours();
    const scored = allSongs.map(s => ({
      song: s,
      score: this.calculateSongScore(s, hour) + Math.random() * 0.15,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(e => e.song);
  }

  getQuickPicks(allSongs: Song[], limit = 20): Song[] {
    if (!this._enabled || allSongs.length === 0) return [];
    const topArtists = new Set(this._getTopArtists(5));
    const topGenres = new Set(this._getTopGenres(3));
    const recentSet = new Set(this._recentlyPlayed.slice(0, 10));

    const candidates = allSongs.filter(s => {
      if (recentSet.has(s.id)) return false;
      if (s.artist && topArtists.has(s.artist)) return true;
      if (s.genre && topGenres.has(s.genre)) return true;
      return false;
    });

    if (candidates.length === 0) return allSongs.slice(0, limit);

    const hour = new Date().getHours();
    candidates.sort((a, b) => this.calculateSongScore(b, hour) - this.calculateSongScore(a, hour));
    return candidates.slice(0, limit);
  }

  getDiscoverMix(allSongs: Song[], limit = 25): Song[] {
    if (!this._enabled || allSongs.length === 0) return [];
    const knownIds = new Set(this._profiles.keys());
    const knownArtists = new Set(this._artistAffinity.keys());

    let newSongs = allSongs.filter(
      s => !knownIds.has(s.id) && !(s.artist && knownArtists.has(s.artist))
    );
    if (newSongs.length === 0) newSongs = allSongs.filter(s => !knownIds.has(s.id));
    if (newSongs.length === 0) return [];

    const topGenres = new Set(this._getTopGenres(5));
    const scored = newSongs.map(s => ({
      song: s,
      score: 0.5 + (s.genre && topGenres.has(s.genre) ? 0.3 : 0) + Math.random() * 0.2,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(e => e.song);
  }

  getArtistMix(allSongs: Song[], artist: string, limit = 25): Song[] {
    if (!this._enabled) return [];
    return allSongs.filter(s => s.artist === artist).slice(0, limit);
  }

  generateMixes(allSongs: Song[]): Record<string, Song[]> {
    if (!this._enabled || allSongs.length === 0) return {};
    const mixes: Record<string, Song[]> = {};

    const quick = this.getQuickPicks(allSongs, 20);
    if (quick.length > 0) mixes["Quick Picks"] = quick;

    const discover = this.getDiscoverMix(allSongs, 20);
    if (discover.length > 0) mixes["Discover Mix"] = discover;

    const topArtists = this._getTopArtists(3);
    for (const artist of topArtists) {
      const mix = this.getArtistMix(allSongs, artist, 15);
      if (mix.length >= 5) mixes[`${artist} Mix`] = mix;
    }

    const hour = new Date().getHours();
    let timeLabel: string;
    if (hour >= 5 && hour < 12) timeLabel = "Morning";
    else if (hour >= 12 && hour < 17) timeLabel = "Afternoon";
    else if (hour >= 17 && hour < 21) timeLabel = "Evening";
    else timeLabel = "Night";

    const hourPatterns = this._timePatterns.get(hour);
    if (hourPatterns && hourPatterns.size > 0) {
      let topGenre = "";
      let topCount = 0;
      for (const [genre, count] of hourPatterns) {
        if (count > topCount) { topCount = count; topGenre = genre; }
      }
      const timeSongs = allSongs.filter(s => s.genre === topGenre).slice(0, 15);
      if (timeSongs.length >= 5) mixes[`${timeLabel} Vibes`] = timeSongs;
    }

    return mixes;
  }

  getRecommendedArtists(limit = 10): string[] { return this._getTopArtists(limit); }
  getRecommendedGenres(limit = 5): string[] { return this._getTopGenres(limit); }

  getListeningStats() {
    let totalPlays = 0;
    let totalDuration = 0;
    for (const p of this._profiles.values()) {
      totalPlays += p.playCount;
      totalDuration += p.totalListenTime;
    }
    return {
      totalPlays,
      totalMinutes: Math.floor(totalDuration / 60),
      uniqueSongs: this._profiles.size,
      uniqueArtists: this._artistAffinity.size,
      uniqueGenres: this._genreAffinity.size,
      topArtists: this._getTopArtists(5),
      topGenres: this._getTopGenres(5),
    };
  }

  clearData(): void {
    this._profiles.clear();
    this._artistAffinity.clear();
    this._genreAffinity.clear();
    this._skipCounts.clear();
    this._timePatterns.clear();
    this._recentlyPlayed = [];
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(SKIP_KEY);
    localStorage.removeItem(TIME_KEY);
  }

  private _getTopArtists(limit: number): string[] {
    if (this._artistAffinity.size === 0) return [];
    return [...this._artistAffinity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(e => e[0]);
  }

  private _getTopGenres(limit: number): string[] {
    if (this._genreAffinity.size === 0) return [];
    return [...this._genreAffinity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(e => e[0]);
  }

  private _saveData(): void {
    try {
      const data = {
        profiles: Object.fromEntries([...this._profiles.entries()].map(([k, v]) => [k, v.toJson()])),
        artists: Object.fromEntries(this._artistAffinity),
        genres: Object.fromEntries(this._genreAffinity),
        recent: this._recentlyPlayed,
      };
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      localStorage.setItem(SKIP_KEY, JSON.stringify(Object.fromEntries(this._skipCounts)));
      const timeData = Object.fromEntries(
        [...this._timePatterns.entries()].map(([k, v]) => [k, Object.fromEntries(v)])
      );
      localStorage.setItem(TIME_KEY, JSON.stringify(timeData));
    } catch (e) {
      console.error("Error saving recommendation data:", e);
    }
  }
}

export const recommendationService = new RecommendationService();
