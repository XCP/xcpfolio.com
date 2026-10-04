/** @jest-environment node */
import { counterpartyRead } from '../lib/counterparty-read';

test('refreshes a fixed continuation URL after a same-height reorg', async () => {
  const original = global.fetch;
  const cache = new Map<string, string>();
  let branch = 'orphan';
  global.fetch = jest.fn(async (input, init) => {
    const url = new URL(String(input));
    expect(init?.cache).toBe('no-store');
    expect(url.searchParams.get('cursor')).toBe('17');
    expect(url.searchParams.get('verbose')).toBe('true');
    if (!cache.has(url.href)) cache.set(url.href, branch);
    return { text: async () => cache.get(url.href) } as Response;
  }) as typeof fetch;
  try {
    const url = 'https://core.test/v2/assets/XCP/orders?cursor=17&verbose=true';
    expect(await (await counterpartyRead(url)).text()).toBe('orphan');
    branch = 'canonical';
    expect(await (await counterpartyRead(url)).text()).toBe('canonical');
  } finally { global.fetch = original; }
});
