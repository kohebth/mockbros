# Live Audio Smoketest

Small browser UI plus Playwright smoke test for the Mockbros live interview audio WebSocket flow.

## Run

Start the backend first from `backend`:

```bash
npm run dev
```

Then run the smoke test:

```bash
cd smoketest
npm install
npx playwright install chromium
npm test
```

Use a different backend with:

```bash
BACKEND_URL=http://localhost:3000 npm test
```

The test launches Chromium with fake microphone permissions, records a short `MediaRecorder` sample, sends it as `audio_final`, and waits for `transcript_final`.
