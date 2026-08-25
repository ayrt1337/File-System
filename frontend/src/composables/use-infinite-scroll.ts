import { onMounted, onUnmounted, watch, type Ref } from "vue";

interface UseInfiniteScrollOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: Ref<boolean> | (() => boolean);
}

export function useInfiniteScroll(
  sentinelRef: Ref<HTMLElement | null>,
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {},
) {
  let observer: IntersectionObserver | null = null;

  const isEnabled = () => {
    if (typeof options.enabled === "function") return options.enabled();
    if (options.enabled !== undefined) return options.enabled.value;
    return true;
  };

  const setupObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (!sentinelRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && isEnabled()) {
          onLoadMore();
        }
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || "200px",
        threshold: options.threshold ?? 0.1,
      },
    );

    observer.observe(sentinelRef.value);
  };

  watch(sentinelRef, () => {
    setupObserver();
  });

  onMounted(() => {
    setupObserver();
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  return {
    setupObserver,
  };
}
