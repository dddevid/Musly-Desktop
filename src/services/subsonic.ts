// Subsonic API Client
// Supports: Navidrome, Subsonic, Airsonic, Gonic

function md5(input: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function computeMD5(m: number[], l: number): number[] {
    m[l >> 5] |= 0x80 << l % 32;
    m[(((l + 64) >>> 9) << 4) + 14] = l;
    let i: number, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (i = 0; i < m.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a,b,c,d,m[i],7,-680876936); d = md5ff(d,a,b,c,m[i+1],12,-389564586);
      c = md5ff(c,d,a,b,m[i+2],17,606105819); b = md5ff(b,c,d,a,m[i+3],22,-1044525330);
      a = md5ff(a,b,c,d,m[i+4],7,-176418897); d = md5ff(d,a,b,c,m[i+5],12,1200080426);
      c = md5ff(c,d,a,b,m[i+6],17,-1473231341); b = md5ff(b,c,d,a,m[i+7],22,-45705983);
      a = md5ff(a,b,c,d,m[i+8],7,1770035416); d = md5ff(d,a,b,c,m[i+9],12,-1958414417);
      c = md5ff(c,d,a,b,m[i+10],17,-42063); b = md5ff(b,c,d,a,m[i+11],22,-1990404162);
      a = md5ff(a,b,c,d,m[i+12],7,1804603682); d = md5ff(d,a,b,c,m[i+13],12,-40341101);
      c = md5ff(c,d,a,b,m[i+14],17,-1502002290); b = md5ff(b,c,d,a,m[i+15],22,1236535329);
      a = md5gg(a,b,c,d,m[i+1],5,-165796510); d = md5gg(d,a,b,c,m[i+6],9,-1069501632);
      c = md5gg(c,d,a,b,m[i+11],14,643717713); b = md5gg(b,c,d,a,m[i],20,-373897302);
      a = md5gg(a,b,c,d,m[i+5],5,-701558691); d = md5gg(d,a,b,c,m[i+10],9,38016083);
      c = md5gg(c,d,a,b,m[i+15],14,-660478335); b = md5gg(b,c,d,a,m[i+4],20,-405537848);
      a = md5gg(a,b,c,d,m[i+9],5,568446438); d = md5gg(d,a,b,c,m[i+14],9,-1019803690);
      c = md5gg(c,d,a,b,m[i+3],14,-187363961); b = md5gg(b,c,d,a,m[i+8],20,1163531501);
      a = md5gg(a,b,c,d,m[i+13],5,-1444681467); d = md5gg(d,a,b,c,m[i+2],9,-51403784);
      c = md5gg(c,d,a,b,m[i+7],14,1735328473); b = md5gg(b,c,d,a,m[i+12],20,-1926607734);
      a = md5hh(a,b,c,d,m[i+5],4,-378558); d = md5hh(d,a,b,c,m[i+8],11,-2022574463);
      c = md5hh(c,d,a,b,m[i+11],16,1839030562); b = md5hh(b,c,d,a,m[i+14],23,-35309556);
      a = md5hh(a,b,c,d,m[i+1],4,-1530992060); d = md5hh(d,a,b,c,m[i+4],11,1272893353);
      c = md5hh(c,d,a,b,m[i+7],16,-155497632); b = md5hh(b,c,d,a,m[i+10],23,-1094730640);
      a = md5hh(a,b,c,d,m[i+13],4,681279174); d = md5hh(d,a,b,c,m[i],11,-358537222);
      c = md5hh(c,d,a,b,m[i+3],16,-722521979); b = md5hh(b,c,d,a,m[i+6],23,76029189);
      a = md5hh(a,b,c,d,m[i+9],4,-640364487); d = md5hh(d,a,b,c,m[i+12],11,-421815835);
      c = md5hh(c,d,a,b,m[i+15],16,530742520); b = md5hh(b,c,d,a,m[i+2],23,-995338651);
      a = md5ii(a,b,c,d,m[i],6,-198630844); d = md5ii(d,a,b,c,m[i+7],10,1126891415);
      c = md5ii(c,d,a,b,m[i+14],15,-1416354905); b = md5ii(b,c,d,a,m[i+5],21,-57434055);
      a = md5ii(a,b,c,d,m[i+12],6,1700485571); d = md5ii(d,a,b,c,m[i+3],10,-1894986606);
      c = md5ii(c,d,a,b,m[i+10],15,-1051523); b = md5ii(b,c,d,a,m[i+1],21,-2054922799);
      a = md5ii(a,b,c,d,m[i+8],6,1873313359); d = md5ii(d,a,b,c,m[i+15],10,-30611744);
      c = md5ii(c,d,a,b,m[i+6],15,-1560198380); b = md5ii(b,c,d,a,m[i+13],21,1309151649);
      a = md5ii(a,b,c,d,m[i+4],6,-145523070); d = md5ii(d,a,b,c,m[i+11],10,-1120210379);
      c = md5ii(c,d,a,b,m[i+2],15,718787259); b = md5ii(b,c,d,a,m[i+9],21,-343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function str2binl(str: string): number[] {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8)
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    return bin;
  }
  function binl2hex(binarray: number[]): string {
    const hexTab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < binarray.length * 4; i++)
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    return str;
  }
  const encoded = unescape(encodeURIComponent(input));
  return binl2hex(computeMD5(str2binl(encoded), encoded.length * 8));
}

export interface SubsonicConfig {
  serverUrl: string;
  username: string;
  password: string;
  legacyAuth: boolean;
}

export interface Artist {
  id: string;
  name: string;
  albumCount?: number;
  coverArt?: string;
  starred?: string;
}

export interface Album {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  coverArt?: string;
  songCount?: number;
  duration?: number;
  year?: number;
  genre?: string;
  starred?: string;
  playCount?: number;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  coverArt?: string;
  duration?: number;
  track?: number;
  discNumber?: number;
  year?: number;
  genre?: string;
  size?: number;
  contentType?: string;
  suffix?: string;
  bitRate?: number;
  starred?: string;
  playCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  comment?: string;
  owner?: string;
  public?: boolean;
  songCount?: number;
  duration?: number;
  coverArt?: string;
  changed?: string;
  created?: string;
}

export interface PlaylistWithSongs extends Playlist {
  entry: Song[];
}

export interface SearchResult {
  artist?: Artist[];
  album?: Album[];
  song?: Song[];
}

export interface Lyrics {
  artist?: string;
  title?: string;
  value?: string;
}

export interface LyricLine {
  start?: number; // milliseconds
  value: string;
}

export interface StructuredLyrics {
  displayArtist?: string;
  displayTitle?: string;
  lang?: string;
  offset?: number;
  synced: boolean;
  line: LyricLine[];
}

let config: SubsonicConfig | null = null;

export function setConfig(c: SubsonicConfig) {
  config = c;
}

export function getConfig(): SubsonicConfig | null {
  return config;
}

function buildParams(extra: Record<string, string> = {}): string {
  if (!config) throw new Error("Not configured");

  const params: Record<string, string> = {
    u: config.username,
    v: "1.16.1",
    c: "musly-desktop",
    f: "json",
    ...extra,
  };

  if (config.legacyAuth) {
    params.p = `enc:${config.password.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")}`;
  } else {
    const salt = Math.random().toString(36).substring(2, 12);
    const token = md5(config.password + salt);
    params.t = token;
    params.s = salt;
  }

  return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

async function apiRequest<T>(endpoint: string, extra: Record<string, string> = {}): Promise<T> {
  if (!config) throw new Error("Not configured");
  const url = `${config.serverUrl.replace(/\/$/, "")}/rest/${endpoint}?${buildParams(extra)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data["subsonic-response"]?.status !== "ok") {
    throw new Error(data["subsonic-response"]?.error?.message || "API error");
  }
  return data["subsonic-response"] as T;
}

export async function ping(): Promise<boolean> {
  try {
    await apiRequest<unknown>("ping");
    return true;
  } catch {
    return false;
  }
}


const coverArtCache: Record<string, string> = {};

export function getCoverArtUrl(id: string, size = 300): string {
  if (!config || !id) return "";
  return `${config.serverUrl.replace(/\/$/, "")}/rest/getCoverArt?${buildParams({ id, size: String(size) })}`;
}

export function getCachedCoverArtUrl(id: string, size = 300): string {
  if (!id) return "";
  const cacheKey = `${id}_${size}`;
  if (coverArtCache[cacheKey]) {
    return coverArtCache[cacheKey];
  }
  const url = getCoverArtUrl(id, size);
  coverArtCache[cacheKey] = url;
  return url;
}

export function getStreamUrl(
  id: string,
  maxBitRate?: number | null,
  format?: string | null
): string {
  if (!config) return "";
  const extra: Record<string, string> = {};
  if (maxBitRate) extra.maxBitRate = String(maxBitRate);
  if (format) extra.format = format;
  return `${config.serverUrl.replace(/\/$/, "")}/rest/stream?${buildParams({ id, ...extra })}`;
}

export async function getArtists(): Promise<{ index: { name: string; artist: Artist[] }[] }> {
  const res = await apiRequest<{ artists: { index: { name: string; artist: Artist[] }[] } }>("getArtists");
  return res.artists;
}

export async function getArtist(id: string): Promise<{ artist: Artist & { album: Album[] } }> {
  const res = await apiRequest<{ artist: Artist & { album: Album[] } }>("getArtist", { id });
  return res;
}

export async function getAlbum(id: string): Promise<Album & { song: Song[] }> {
  const res = await apiRequest<{ album: Album & { song: Song[] } }>("getAlbum", { id });
  return res.album;
}

export async function getAlbumList(
  type: "newest" | "frequent" | "recent" | "random" | "starred" | "alphabeticalByName",
  size = 20,
  offset = 0
): Promise<Album[]> {
  const res = await apiRequest<{ albumList2: { album?: Album[] } }>("getAlbumList2", {
    type,
    size: String(size),
    offset: String(offset),
  });
  return res.albumList2?.album || [];
}

export async function search(query: string): Promise<SearchResult> {
  const res = await apiRequest<{
    searchResult3: { artist?: Artist[]; album?: Album[]; song?: Song[] };
  }>("search3", { query, artistCount: "5", albumCount: "10", songCount: "20" });
  return res.searchResult3;
}

export async function getPlaylists(): Promise<Playlist[]> {
  const res = await apiRequest<{ playlists: { playlist?: Playlist[] } }>("getPlaylists");
  return res.playlists?.playlist || [];
}

export async function getPlaylist(id: string): Promise<PlaylistWithSongs> {
  const res = await apiRequest<{ playlist: PlaylistWithSongs }>("getPlaylist", { id });
  return res.playlist;
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const res = await apiRequest<{ playlist: Playlist }>("createPlaylist", { name });
  return res.playlist;
}

export async function deletePlaylist(id: string): Promise<void> {
  await apiRequest("deletePlaylist", { id });
}

export async function updatePlaylist(playlistId: string, songIdsToAdd: string[]): Promise<void> {
  if (!config) throw new Error("Not configured");
  // songIdToAdd must be repeated for each song, so build the URL manually
  const base = `${config.serverUrl.replace(/\/$/, "")}/rest/updatePlaylist?${buildParams({ playlistId })}`;
  const songParams = songIdsToAdd.map(id => `songIdToAdd=${encodeURIComponent(id)}`).join("&");
  const url = songParams ? `${base}&${songParams}` : base;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data["subsonic-response"]?.status !== "ok") {
    throw new Error(data["subsonic-response"]?.error?.message || "API error");
  }
}

export async function getStarred(): Promise<{ artist?: Artist[]; album?: Album[]; song?: Song[] }> {
  const res = await apiRequest<{
    starred2: { artist?: Artist[]; album?: Album[]; song?: Song[] };
  }>("getStarred2");
  return res.starred2;
}

export async function star(id: string): Promise<void> {
  await apiRequest("star", { id });
}

export async function unstar(id: string): Promise<void> {
  await apiRequest("unstar", { id });
}

export async function getLyrics(artist: string, title: string): Promise<Lyrics> {
  const res = await apiRequest<{ lyrics: Lyrics }>("getLyrics", { artist, title });
  return res.lyrics;
}

export async function getLyricsBySongId(id: string): Promise<StructuredLyrics[]> {
  try {
    const res = await apiRequest<{ lyricsList: { structuredLyrics?: StructuredLyrics[] } }>(
      "getLyricsBySongId", { id }
    );
    return res.lyricsList?.structuredLyrics ?? [];
  } catch {
    return [];
  }
}

export async function scrobble(id: string, submission = true): Promise<void> {
  await apiRequest("scrobble", { id, submission: String(submission) });
}

export async function getRandomSongs(size = 30): Promise<Song[]> {
  const res = await apiRequest<{ randomSongs: { song?: Song[] } }>("getRandomSongs", { size: String(size) });
  return res.randomSongs?.song || [];
}

export async function getSimilarSongs(id: string, count = 20): Promise<Song[]> {
  const res = await apiRequest<{ similarSongs2: { song?: Song[] } }>("getSimilarSongs2", { id, count: String(count) });
  return res.similarSongs2?.song || [];
}

export async function getTopSongs(artist: string, count = 20): Promise<Song[]> {
  const res = await apiRequest<{ topSongs: { song?: Song[] } }>("getTopSongs", { artist, count: String(count) });
  return res.topSongs?.song || [];
}
