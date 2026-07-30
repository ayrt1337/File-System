import { defineStore } from "pinia";
import { api } from "../services/api";
import { API_ROUTES, getRouteWithPathParams, PARAMS } from "../routing/routes";

export interface CacheEntry {
  value: string;
  expiresAt: number;
}

const CACHE_PREFIXES = {
  url: "file_cache_url_",
  preview: "file_cache_preview_",
  download: "file_cache_download_url_",
} as const;

function setLocalCache(prefix: string, fileId: string, value: string, expiresInMs: number): CacheEntry {
  const data: CacheEntry = {
    value,
    expiresAt: Date.now() + expiresInMs,
  };
  localStorage.setItem(`${prefix}${fileId}`, JSON.stringify(data));
  return data;
}

function getLocalCache(prefix: string, fileId: string): CacheEntry | null {
  const key = `${prefix}${fileId}`;
  const localData = localStorage.getItem(key);
  if (!localData) return null;
  try {
    const parsed: CacheEntry = JSON.parse(localData);
    if (parsed && parsed.expiresAt > Date.now()) {
      return parsed;
    }
    localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
  return null;
}

function checkAndSyncCache(
  stateCache: Record<string, CacheEntry>,
  prefix: string,
  fileId: string
): boolean {
  const stateCached = stateCache[fileId];
  if (stateCached && stateCached.expiresAt > Date.now()) {
    return true;
  }
  const entry = getLocalCache(prefix, fileId);
  if (entry) {
    stateCache[fileId] = entry;
    return true;
  }
  if (stateCache[fileId]) {
    delete stateCache[fileId];
  }
  return false;
}

function clearLocalCache(prefix: string) {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export const useFileCacheStore = defineStore("fileCache", {
  state: () => ({
    urlCache: {} as Record<string, CacheEntry>,
    previewCache: {} as Record<string, CacheEntry>,
    downloadUrlCache: {} as Record<string, CacheEntry>,
  }),
  actions: {
    hasUrlCache(fileId: string): boolean {
      return checkAndSyncCache(this.urlCache, CACHE_PREFIXES.url, fileId);
    },
    hasDownloadUrlCache(fileId: string): boolean {
      return checkAndSyncCache(this.downloadUrlCache, CACHE_PREFIXES.download, fileId);
    },
    hasPreviewCache(fileId: string): boolean {
      return checkAndSyncCache(this.previewCache, CACHE_PREFIXES.preview, fileId);
    },
    setUrlCache(
      fileId: string,
      url: string,
      expiresInMs: number = 14 * 60 * 1000,
    ) {
      this.urlCache[fileId] = setLocalCache(CACHE_PREFIXES.url, fileId, url, expiresInMs);
    },
    setDownloadUrlCache(
      fileId: string,
      url: string,
      expiresInMs: number = 14 * 60 * 1000,
    ) {
      this.downloadUrlCache[fileId] = setLocalCache(CACHE_PREFIXES.download, fileId, url, expiresInMs);
    },
    setPreviewCache(
      fileId: string,
      preview: string,
      expiresInMs: number = 14 * 60 * 1000,
    ) {
      this.previewCache[fileId] = setLocalCache(CACHE_PREFIXES.preview, fileId, preview, expiresInMs);
    },
    getUrlCache(fileId: string): string | null {
      return this.hasUrlCache(fileId) ? this.urlCache[fileId]?.value ?? null : null;
    },
    getDownloadUrlCache(fileId: string): string | null {
      return this.hasDownloadUrlCache(fileId) ? this.downloadUrlCache[fileId]?.value ?? null : null;
    },
    getPreviewCache(fileId: string): string | null {
      return this.hasPreviewCache(fileId) ? this.previewCache[fileId]?.value ?? null : null;
    },
    getCache(fileId: string) {
      const url = this.getUrlCache(fileId);
      const preview = this.getPreviewCache(fileId);
      const downloadUrl = this.getDownloadUrlCache(fileId);
      return { url, preview, downloadUrl };
    },
    async getOrFetch(
      fileId: string,
      type: "preview" | "url" | "both" | "download",
    ) {
      const hasUrl = this.hasUrlCache(fileId);
      const hasPreview = this.hasPreviewCache(fileId);
      const hasDownload = this.hasDownloadUrlCache(fileId);

      let needFetch = false;
      if (type === "url" && !hasUrl) needFetch = true;
      else if (type === "preview" && !hasPreview) needFetch = true;
      else if (type === "download" && !hasDownload) needFetch = true;
      else if (type === "both" && (!hasUrl || !hasPreview)) needFetch = true;

      if (needFetch) {
        const path = getRouteWithPathParams(API_ROUTES.FILE.GET_URL, {
          [PARAMS.ID]: fileId,
        });
        const { data } = await api.get(path, {
          params: { type },
        });

        if (type === "url") {
          if (data.url) this.setUrlCache(fileId, data.url);
        } else if (type === "download") {
          if (data.url) this.setDownloadUrlCache(fileId, data.url);
        } else if (type === "preview") {
          if (data.preview) this.setPreviewCache(fileId, data.preview);
        } else if (type === "both") {
          if (data.url) this.setUrlCache(fileId, data.url);
          if (data.preview) this.setPreviewCache(fileId, data.preview);
        }
      }

      return this.getCache(fileId);
    },
    invalidateUrlCache(fileId: string) {
      if (this.urlCache[fileId]) delete this.urlCache[fileId];
      localStorage.removeItem(`${CACHE_PREFIXES.url}${fileId}`);
    },
    invalidatePreviewCache(fileId: string) {
      if (this.previewCache[fileId]) delete this.previewCache[fileId];
      localStorage.removeItem(`${CACHE_PREFIXES.preview}${fileId}`);
    },
    invalidateDownloadUrlCache(fileId: string) {
      if (this.downloadUrlCache[fileId]) delete this.downloadUrlCache[fileId];
      localStorage.removeItem(`${CACHE_PREFIXES.download}${fileId}`);
    },
    invalidateFileCache(fileId: string) {
      this.invalidateUrlCache(fileId);
      this.invalidatePreviewCache(fileId);
      this.invalidateDownloadUrlCache(fileId);
    },
    clearUrlCache() {
      this.urlCache = {};
      clearLocalCache(CACHE_PREFIXES.url);
    },
    clearPreviewCache() {
      this.previewCache = {};
      clearLocalCache(CACHE_PREFIXES.preview);
    },
    clearDownloadCache() {
      this.downloadUrlCache = {};
      clearLocalCache(CACHE_PREFIXES.download);
    },
    clearCache() {
      this.clearUrlCache();
      this.clearPreviewCache();
      this.clearDownloadCache();
    },
  },
});
