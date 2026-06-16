import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { listProducts } from '../api/client';
import type { Product, ProductCategory } from '../types/domain';

// Single source of truth for the product catalogue on the client.
//
// We pull the *entire* product list once and cache it in React Query.
// The catalogue is ~30 rows and ~5 KB on the wire, so per-category
// roundtrips were pure overhead — opening a category meant waiting on
// the network every time. Fetching once and filtering client-side
// makes category navigation feel instant after the first open.
//
// Staleness: 5 min. Long enough that the second-screen tap is a cache
// hit; short enough that a price edit in Supabase shows up within a few
// minutes without a force-refresh.
const STALE_MS = 5 * 60_000;
const KEY = ['products', 'all'] as const;

export function useAllProducts() {
  return useQuery<Product[]>({
    queryKey: [...KEY],
    queryFn: () => listProducts({}),
    staleTime: STALE_MS,
  });
}

// Convenience wrapper for the Finish screen: derive the per-category
// view from the cached "all products" list. Returns the active SKUs
// in declaration order.
export function useProductsByCategory(category: ProductCategory): {
  products: Product[];
  isLoading: boolean;
} {
  const { data, isLoading } = useAllProducts();
  const products = useMemo(
    () => (data ?? []).filter((p) => p.category === category && p.is_active),
    [data, category],
  );
  return { products, isLoading: isLoading && !data };
}

// Kick off the fetch as soon as we know it's safe to (post-auth hydrate).
// Calling this once at boot warms the cache so the first category tap
// shows the list immediately. Idempotent — React Query dedupes parallel
// fetches and the staleTime guards against re-firing on every render.
export function usePrefetchProducts() {
  const qc = useQueryClient();
  useEffect(() => {
    qc.prefetchQuery({
      queryKey: [...KEY],
      queryFn: () => listProducts({}),
      staleTime: STALE_MS,
    }).catch(() => undefined);
  }, [qc]);
}
