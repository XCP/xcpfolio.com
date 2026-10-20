# Casa Tookan pilot

The app manifest at `/.well-known/wallet-app.json` reuses the existing site icon. It declares optional Bitcoin support and requires no wallet to browse. No development bridge or framing-policy relaxation is shipped.

## Wallet connection pilot

Build with `NEXT_PUBLIC_CASATOOKAN_ENABLED=true` to include Casa Tookan in the SDK chooser. It is off by default. The SDK is pinned to `25425b75142f832705d1c3611ab2cba2adc0f942` (XCP/wallet-sdk#13), including revoked-grant recovery and session-listener restart fixes.

Mainnet Legacy and Native SegWit accounts are supported. Ordinary compose flows use the SDK PSBT fallback. Taproot, nested SegWit, selected-input signing, batches and non-ALL signatures are refused by the adapter.

`npm run test:casatookan` exercises the actual site connection UI with a deterministic test bridge, including signed proofs where the site requests them, rejection/retry, unsupported accounts, chooser selection, mobile late injection, disconnect and revoked grants after reload. `CASATOOKAN_TEST_ENABLED=false npm run test:casatookan` checks the disabled pilot (set the environment variable in the syntax for your shell). Tests use an unfunded fixture and never broadcast.

The SDK has separate live web-development-signer evidence in its PR. These site regressions are simulated-provider tests, not installed iOS/Android or funded-trade verification. Those checks remain required before enabling production.

## Local QA — 2026-10-20

Seven enabled browser checks and two disabled-pilot checks passed on `/how-it-works`. Typecheck and all 17 Jest tests passed. Browser specs are excluded from Jest. All lockfiles pass `npm ci --dry-run --ignore-scripts`.

The browser fixture signs deterministic test messages. Public API calls are blocked, so these runs do not prove live backend authentication or transaction composition. No production deployment or broadcast was performed.
