# Sakura Season — Visual Novel (Pure Static Frontend)

A Japanese-style visual novel about farewells, promises and regret. **Fully static, zero backend**:
no server, no database, no login. All save data and progress live in the player's own browser
(IndexedDB) and can be exported / imported as a JSON backup.

- Repository: <https://github.com/MrWoods1692/galagame>
- License: AGPL-3.0

## Features

- **Pure static frontend** — the build output is plain files under `dist/`, with zero external requests at runtime.
- **Local database saves** — 6 save slots, endings, recall events, CG gallery and settings are stored in IndexedDB (database `galagame`).
- **Exportable data** — export everything to a JSON backup from the settings panel, or import one to restore.
- **Assets shipped in-repo** — backgrounds, character portraits and 107 voiced lines (`public/audio/voices/`).
- **Procedurally synthesised BGM** — four moods (daily / sorrow / quiet / hope) generated with Tone.js, no audio files needed.
- **Mobile friendly** — auto-landscape container, one-hand portrait mode, tap to advance.

## Getting started

```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run build    # type-check + build into dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```

## Deployment

The generated `dist/` folder works on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages,
or a plain `python3 -m http.server`). `base: './'` in `vite.config.ts` keeps asset URLs relative, so the
site also works from a sub-path such as `https://<user>.github.io/galagame/`.

## Where the data lives

- IndexedDB database `galagame`, object store `kv`.
- Keys: `sakura_vn_slot_0` … `sakura_vn_slot_5` (save slots), `sakura_vn_meta` (collection progress + settings).
- Falls back to `localStorage` when IndexedDB is unavailable (and to in-memory storage as a last resort).
- Legacy saves left in `localStorage` by earlier builds are migrated automatically on startup.
- Settings → save data → Export writes `galagame-save-<timestamp>.json`.

## Project layout

```txt
index.html                entry HTML
public/favicon.svg        site icon
public/audio/voices/      voiced lines (static MP3)
src/main.tsx              entry: hydrate local database, then render
src/db/localDb.ts         IndexedDB access layer with storage fallbacks
src/game/store.ts         saves / progress / settings persistence + export & import
src/game/script.ts        story script DSL (say / bg / show / hide / bgm / mark / ending)
src/game/screens/         title, gameplay, collection screens
src/game/components/      dialog box, control bar, save panel, settings, open-source sheet
src/game/audio/           Tone.js BGM engine + local voice player
vite.config.ts            base: './' so the build runs from any path
```

## License

AGPL-3.0 — see [LICENSE](./LICENSE).
