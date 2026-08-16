import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// gcTime must be >= the persister's maxAge below, or TanStack Query
// will garbage-collect cached data before it ever gets persisted.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30s: data is "fresh" for this long, no refetch on remount
      gcTime: 24 * 60 * 60 * 1000, // 24h: how long unused cache stays in memory/storage
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Persists the whole query cache to localStorage. On page load, cached
// data is restored instantly (fast paint), then React Query refetches
// in the background and swaps in fresh data once it arrives.
export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "APP_QUERY_CACHE", // bump this string if you ever change cached data shapes
});

export const persistOptions = {
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24h — matches gcTime above
  buster: "v1", // bump this to invalidate all persisted caches after a breaking change
};