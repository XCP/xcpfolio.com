/** Core keys cached responses by URL (and sometimes height). Browser no-store
 * alone cannot invalidate an orphaned response inside Core. Repeated scalar
 * parameters use the first value; the second verbose value changes only the
 * cache key, including on continuation pages.
 */
export function freshCounterpartyUrl(input: string): string {
  const url = new URL(input);
  const verbose = url.searchParams.get('verbose') ?? 'false';
  url.searchParams.delete('verbose');
  url.searchParams.append('verbose', verbose);
  url.searchParams.append('verbose', crypto.randomUUID());
  return url.href;
}

export function counterpartyRead(input: string, init?: RequestInit): Promise<Response> {
  return fetch(freshCounterpartyUrl(input), { ...init, cache: 'no-store', next: { revalidate: 0 } });
}
