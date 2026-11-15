# NOVA — Project Coordination

**Last updated:** 14 November 2026  
**Project status:** Pre-development  
**Repository:** Not yet created / confirmed  
**Current milestone:** Windows transparent-overlay feasibility spike

---

## 1. Product vision

Nova is an original, interactive desktop superhero companion.

The goal is to make the desktop feel more alive through a character with personality, expressive animations, movement and useful interactions.

**Positioning:** Your desktop, with a personality.

Nova should feel like a character inhabiting the desktop—not merely a widget, wallpaper, application launcher or conventional desktop pet.

The initial creative inspiration is the satisfying movement and web-like interactions associated with a superhero such as Spider-Man. Nova must remain an original character and must not copy Marvel's protected character identity, costume, logo or distinctive visual expression.

## 2. Business objective and constraints

- Build a globally sellable indie product alongside a full-time job.
- Initial revenue objective: first $1,000.
- Available development time: approximately 5–7 hours per week.
- Initial budget: approximately $0–20.
- Validate demand before investing months in development.
- Prioritise product quality, commercial validation and engineering simplicity.
- Challenge assumptions; do not build features merely because they sound exciting.

This is a side business, not a commitment to become a full-time indie developer.

## 3. Product decisions

| Area | Current decision |
|---|---|
| Product | Nova desktop companion |
| Initial platform | Windows |
| Future platform | macOS |
| Character placement | Freely movable desktop overlay |
| Initial visual direction | Cute, slightly stylised original superhero |
| Further visual direction | Premium cinematic version to explore |
| Core appeal | Personality + useful superhero-themed interactions |
| Monetisation hypothesis | Paid base experience and optional packs |
| Development status | Not started |

### Visual assets already created

- One cute superhero concept sheet with several expressions and poses.
- One six-scene storyboard covering appearance, click reaction, application launch, celebration, utility interaction and idle/sleeping state.

These are concept references only. They are not production-ready animation assets or a functioning prototype.

A premium cinematic visual direction remains to be explored.

## 4. Product experience and feature scope

### MVP — first working prototype

The first prototype should establish:

1. Transparent, frameless desktop window.
2. Character remains above normal application windows.
3. Character can be moved around the desktop.
4. Basic idle animation.
5. Click reaction.
6. Basic hide/show controls.
7. Reliable exit/quit.
8. Basic CPU and memory usage check.

### First useful interaction — after overlay feasibility

Allow the user to configure one application. A character interaction should launch that application.

Handle missing application paths and allow the user to change or disable the configured action.

### Future product capabilities — not part of the first spike

- More expressive animations and character behaviours.
- Superhero movement, tether and projectile interactions.
- Character outfits, animation packs and additional characters.
- Themes and environments.
- Optional live-wallpaper mode.

### New product proposals — validate separately

**A. Optional live wallpaper mode**

The default experience should preserve the user's existing wallpaper, with Nova floating above it. A separate optional themed live-wallpaper mode may be explored later.

**B. Superhero desktop masking interaction**

A user could aim and deploy a themed visual effect—such as a web, fire effect or ice shield—over a selected desktop area. The effect could be resized, repositioned and dismissed.

The initial use case is concealing desktop icons or clutter during screen sharing without moving or deleting the underlying items.

Important distinction:
- Covering desktop icons is one technical problem.
- Covering arbitrary application windows, tabs or their contents is a different and substantially more complex problem.

Do not promise that Nova can hide application tabs or windows until feasibility, focus behaviour and screen-sharing compatibility have been tested.

These two proposals are not MVP commitments. Keep them out of the initial feasibility spike.

## 5. Technical direction

**Provisional candidate stack:**
- Tauri 2
- React
- TypeScript
- Rust

This stack is not irrevocably locked. Validate the Windows overlay requirements first. Compare Electron or native Windows alternatives only if the evidence suggests Tauri is unsuitable.

### Windows risks to investigate

- Transparent window rendering.
- Frameless window behaviour.
- Always-on-top behaviour.
- Dragging and mouse interaction.
- Click-through behaviour where needed.
- Window focus and activation.
- Multi-monitor positioning.
- DPI scaling.
- Fullscreen application behaviour.
- Startup, hide/show and exit.
- CPU and memory usage.
- Packaging and installation experience.

Use current official Tauri 2 documentation and distinguish documented behaviour from assumptions that require a local proof of concept.

## 6. Privacy principles

Nova should initially be local-first.

It must not:
- Read the user's screen.
- Capture screenshots.
- Track keystrokes.
- Read notifications.
- Collect user files.
- Upload personal information.
- Perform hidden autonomous actions.

Users must have obvious controls to hide, pause, configure and quit Nova.

## 7. Market and validation context

The desktop companion category already has competitors and adjacent products, including Mischi, Masko, OpenPets, Desktamer, Desktop Mate, Bongo Cat, Shimeji, Tiny Pasture, Mini Cozy Room, Moji and Asiden.

A character sitting on the desktop is not sufficient differentiation.

Potential differentiation:
- High-quality superhero-themed interactions.
- Animations connected to real desktop actions.
- Strong character personality.
- Lightweight useful functionality.
- Distinctive visual design and optional customisation.

An early Reddit concept post received approximately 130 views and no comments after roughly three hours. This is insufficient evidence of demand.

The concept post tested the broad companion idea, not the detailed interaction mechanics. Further private validation is required.

Do not publicly reveal the complete interaction system, detailed storyboard or proprietary implementation details unnecessarily.

Nagomi was an inspiration for the desktop experience opportunity. Its reported commercial figures were user-provided and unaudited. The prior technical inspection was partial; do not treat inferred implementation details as confirmed facts or copy its assets or code.

## 8. Monetisation hypothesis

Initial pricing hypothesis: approximately $9.99 for the base Nova experience.

Potential later paid items:
- Animation packs.
- Character outfits.
- Additional characters.
- Themes and environments.
- Special interaction packs.

Pricing is unvalidated. Do not build a marketplace or payment system before validating demand for the core companion.

## 9. Development workflow

### GitHub

GitHub should become the source of truth for project code and coordination.

Planned repository:
- Private repository.
- `coordination.md` at repository root.
- `README.md`.
- `.gitignore`.
- No secrets, API keys or credentials in Git.

Repository name candidate: `nova-desktop`.

Repository owner and creation status must be confirmed before claiming the repository exists.

### Claude workflow

Two Claude Free accounts and a separate Claude Opus session may be used to extend limited usage.

Every Claude session must:
1. Read `coordination.md`.
2. Inspect the current repository state.
3. Work on one explicitly scoped task.
4. Report files changed, commands run, tests performed and unresolved issues.
5. Update `coordination.md` when project status or decisions change.

Before switching machines or sessions:
- Commit and push completed work.
- Pull the latest changes before continuing.
- Do not let two sessions edit the same working tree simultaneously.

Use the professional/work laptop for personal development only if employer policy permits. Never transfer EY data, credentials, confidential information or proprietary code into this project.

## 10. Current status

| Item | Status |
|---|---|
| Product opportunity exploration | Complete |
| Nova concept selected | Complete |
| Cute character concept sheet | Generated |
| Six-scene storyboard | Generated |
| Windows-first decision | Established |
| Competitor research | Initial |
| Nagomi inspection | Partial |
| Reddit concept validation | Insufficient |
| Cinematic character direction | Pending |
| Customer validation | Incomplete |
| GitHub repository | Not confirmed |
| `coordination.md` in repository | Not yet established |
| Claude implementation | Not started |
| Windows overlay prototype | Not started |
| First paying customer | Not yet |

Do not mark an item complete without evidence.

### Overlay POC progress log (updated 14 November 2026)

**Verified (file inspection or user-supplied output):**
- `app/` contains a Tauri 2 + React 19 + TypeScript scaffold (file inspection). Git commit status unknown.
- Window config: transparent, frameless, always-on-top, `shadow: false`, 220x240, explicit `main` label.
- `npm run tauri dev` compiled and launched `target\debug\app.exe` (user-supplied terminal log). Capability `core:window:allow-start-dragging` is a valid permission name because the build passed.
- Character renders on a transparent background over another app (user-supplied screenshot). Not a full transparency test.
- Fix applied: `App.css` was never imported, so the window was blank. Added the import to `main.tsx`.

- User-reported/observed: dragging works (`startDragging()`, permission and `main` label are good). One full click sequence was captured on the diagnostic panel: pointer down/up, mouse down/up, native click, `REACT handler ran`, `animstart hop` (screenshot, drag ON, input device unknown).
- Static review (no runtime): tray code in `lib.rs` follows the documented Tauri 2 pattern (`tray-icon` feature, `TrayIconBuilder`, menu items `toggle`/`quit`, `app.exit(0)`). `icons/` contains the icon set, so `default_window_icon()` should not be `None` (unverified at runtime). Rust-side `hide()`/`show()` do not need capability entries. No timers, loops or listeners exist apart from React event handlers, one 600 ms timeout per click and a CSS infinite idle animation.

**Open issues:**
- Intermittent click failure reported; not reproduced. Panel and logic left unchanged pending a failing sample.
- Code-reading observation, NOT confirmed: a second click within 600 ms of the first leaves `reacting` already true, so the hop does not restart, and the first timeout then clears the state early. A failing repeat-tap sample would show `REACT handler ran` with no second `animstart hop`.
- Tray, focus and quit behaviour: see the verified manual results below.
- Single-instance guard added in code (see closing section); behaviour not yet tested.

**Not yet tested (needs the Windows machine):** secondary monitor; full-screen video/game behaviour; repeat-tap click behaviour and the intermittent click failure (not reproduced). `skipTaskbar` is now set in config but untested.

**Temporary code:** the green outline and the `.dbg` diagnostic panel have been REMOVED from the source (see closing section). The post-cleanup build has not been run or tested yet.

### Release-build manual test results (user-reported, 15 November 2026)

Tested on the user's Windows machine with `src-tauri\target\release\app.exe` (release build; the diagnostic panel and outline were still present). Results are as reported by the user; the assistant did not run them.

**Passed:**
- Release EXE launches.
- System tray icon appears.
- Tray Hide works.
- Tray Show restores Nova.
- Tray Quit works, and the process terminates after Quit.
- Keyboard focus behaves correctly (user-reported; exact steps not recorded).
- Transparency survives hide/restore.
- Nova stays above ordinary application windows (always-on-top verified for ordinary windows only).
- DPI scaling at 100%, 125% and 150%: passed (user-reported; the exact checks performed were not recorded).

**Resource measurements (release EXE, PID 19936, user-observed, 15 November 2026):**

| State | Duration | CPU observed | RAM observed |
|---|---:|---:|---:|
| Idle | 120 s | 0% | 26.52-26.78 MB |
| Dragging | 60 s | 0.04-2.46% | 26.52 MB |
| Animation | 60 s | 0-0.08% | 26.78-26.82 MB |

These are manual observations, not automated benchmark results. The measurement tool and which processes were counted were not stated. Because a single PID was reported, the figures probably cover `app.exe` only and exclude its `msedgewebview2.exe` child processes, so total memory is likely understated. The diagnostic panel and outline were present during the measurements.

### Status summary (as of 15 November 2026)

**Verified (user-reported on the release build):** launch; tray icon; tray Hide, Show and Quit; process termination after Quit; keyboard focus; transparency after hide/restore; always-on-top above ordinary windows; DPI scaling at 100%, 125% and 150%; dragging; one complete click-reaction sequence (pointer down/up, mouse down/up, click, `REACT handler ran`, `animstart hop`).

**Partially verified:**
- Resource usage: `app.exe` figures only (see the caveat above); total including WebView2 children not measured.
- Click reaction: one successful sequence verified; the intermittent failure was reported but never reproduced, and repeat-tap behaviour (second click within 600 ms) is untested.
- Always-on-top: verified for ordinary windows only.

**Untested:** secondary monitor (not marked passed); full-screen video/game behaviour; hide/restore position across monitors; behaviour when a monitor is unplugged.

**Not tested / not passed:**
- Secondary monitor: NOT tested. Not marked passed.
- Full-screen video/game behaviour: NOT tested. Needs separate consideration.
- Intermittent click failure: not reproduced.

The always-on-top implementation and all application code are unchanged by this update.

**Build note:** `npm run tauri build` produced `app.exe` and an MSI. The NSIS bundle step failed with a download timeout, not a code problem. A bundle-identifier warning (`com.kartik.app` ends in `.app`) is open and unchanged.

### POC closing section (15 November 2026)

**Aggregate resource measurements (user-run, `tools/measure-nova.ps1`, release exe with the diagnostic panel and outline still present; automated script, user-executed; the assistant did not run it):**

| State | Duration | CPU (% of total, 8 logical cores) | Private memory, whole tree | Processes |
|---|---:|---|---|---:|
| Idle | ~60 s, 22 samples | avg 1.50, min 0.42, max 2.80 | avg 74.9 MB (73.5-76.0) | 7 |
| Animated | ~61 s, 27 samples | avg 2.07, min 0.97, max 3.34 | avg 88.2 MB (84.6-90.8) | 7 |

- Tree = app process + 6 `msedgewebview2` children; unrelated WebView2 processes excluded by ancestry.
- Samples were ~2.2-2.7 s apart, so CPU figures are interval averages. How "animated" was driven (click rate) was not stated.
- The `app` process alone used about 4 MB private memory; WebView2 children account for most of the total. The earlier 26 MB single-PID figures are not comparable.
- The "hidden" state was not measured.
- Idle CPU is above zero (about 0.12 of one core on average) while the CSS idle animation runs. Not yet investigated; the debug panel was present during measurement.

**Code and config changes made (source only; NOT yet built or tested):**
- `tauri.conf.json`: `productName` "Nova"; `identifier` `com.kartiktotlani.nova`; `skipTaskbar: true`.
- `Cargo.toml`: `tauri-plugin-single-instance = "2"` under the desktop-target dependencies table.
- `lib.rs`: single-instance plugin registered first (`#[cfg(desktop)]`); on a second launch it shows the main window only if hidden and does not set focus. Tray, hide/show and quit code unchanged.
- `App.tsx` / `App.css`: diagnostic panel, event logging, drag toggle and green outline removed. Drag threshold, `startDragging()`, click reaction and 600 ms timer logic left exactly as before.
- No capability changes (the plugin has no JavaScript API per its docs).
- Not changed: always-on-top, window config other than `skipTaskbar`, artwork.

**Automated checks:** none run. The assistant cannot execute `cargo`, `tsc` or `tauri build` on the user's machine. The user's `npm run tauri build` is the first compile check for these changes.

**Pending user verification:** fresh release build; launch and transparency; drag and click; tray Hide/Show/Quit; no taskbar entry and Alt+Tab behaviour; second launch restores (not duplicates) the window; process exits after Quit.

**Still untested (explicitly):** full-screen video/game behaviour; secondary monitor; monitor disconnect; hidden-state resource use; repeat-tap click behaviour (intermittent click failure not reproduced).

**Known limitations:** installed app identity changed (an MSI built under the old `com.kartik.app` / `app` name, if installed, is a separate product); exe file name may still be `app.exe` (Cargo package name) until verified after build; always-on-top is confirmed only for ordinary windows.

**Next milestone (not started):** character integration. Do not begin until the user has completed the regression checklist and reported results.

### Build verification of the cleanup build (15 November 2026)

**Result: SUCCEEDED (build only; runtime behaviour not yet verified).** The completed log shows `Finished release profile [optimized] target(s) in 5m 41s` and `Finished 2 bundles`. Artifacts reported by the build:
- Executable: `E:\Desktop_Companion\app\src-tauri\target\release\app.exe` (still named `app.exe`; the raw name follows the Cargo package, not `productName`).
- MSI: `E:\Desktop_Companion\app\src-tauri\target\release\bundle\msi\Nova_0.1.0_x64_en-US.msi` (2.12 MiB).
- NSIS: `E:\Desktop_Companion\app\src-tauri\target\release\bundle\nsis\Nova_0.1.0_x64-setup.exe` (1.45 MiB). The NSIS step succeeded this time (the earlier timeout did not recur).
- Installers were built but not installed or run. The Task Manager process name will be `app.exe`.

Earlier (superseded) note: an earlier partial paste was truncated at the final link step and could not confirm success.

What the output does show:
- `tsc` and `vite build` passed (22 modules, JS 236.15 kB, CSS 1.20 kB; the CSS is smaller than before, consistent with the debug styles being removed).
- Cargo added `tauri-plugin-single-instance v2.5.5` and compiled it. Resolved versions: tauri 2.12.5, tauri-utils 2.10.2, tao 0.37.2, wry 0.57.2, tray-icon 0.25.1.
- No warnings appear. The earlier bundle-identifier `.app` warning is absent, which is consistent with the identifier change taking effect.
- The last visible step (final link of the `app` binary, with `lto = true` and `codegen-units = 1`) is slow, and the log was probably copied before it finished. This is an inference, not a confirmed explanation.
- `Cargo.lock` changed (new crate). It will need committing along with the other changes.

**Remaining check:** confirm the exe you test is the newest build (timestamp), since older `app.exe` builds were overwritten in the same path but older installers (e.g. an `app_0.1.0` MSI) may also remain in `bundle\msi`.

### Final manual regression (pending: no results received yet)

Checklist issued to the user: (1) launch, transparency and desktop rendering; (2) drag and click reaction; (3) tray Hide/Show/Quit; (4) no taskbar entry and Alt+Tab behaviour; (5) second launch restores the existing window rather than creating another; (6) process terminates after Quit. Status of each: NOT YET REPORTED.

Untested, not release blockers for the POC: full-screen video/game, secondary monitor, monitor disconnect, hidden-state resource use.

### Character integration proposal (DRAFT; nothing implemented; do not start until the user confirms the regression passed)

**Open decision (blocks the art spec):** which design is canonical. Three references exist: (a) the chibi concept sheet and six-scene sheet shared earlier (cute 3D-style hero, headphones, brown hair, navy/black suit with glowing blue lines, N chest emblem, blue cape, expressive eyes; poses idle, excited, focused, wave, arms crossed, peeking, sleeping); (b) an adult, muscular, anime-style turnaround (front/back/side/head) with a white helmet and star visor, long brown hair and a cyan cape, with no visible eyes; (c) the files in `reference/` (wallpapers, not opened). (b) conflicts with the stated brief (cute, expressive eyes) and would be roughly 7 heads tall, so the face would be a few dozen pixels in a 220x240 window. Working assumption until told otherwise: (a) is canonical; (b) is useful only as an example of a turnaround sheet and for palette ideas.

**Options compared (qualitative; none benchmarked; third-party tool licensing and current features unverified):**

| Option | Look fit | CPU/RAM | State and transition control | Production effort | Verdict |
|---|---|---|---|---|---|
| A. Layered 2D puppet in DOM/CSS (parts animated by transforms) | Limited: no cape deformation, flat lighting | Lowest | Good | Medium (layered art) | Fallback |
| B. Pre-rendered sprite atlases + small canvas player | Best match to premium stylised look; baked lighting and cape motion | Fixed, predictable; RAM = frames x frame size | Full (own state machine) | High up front (frame production) | RECOMMENDED |
| C. Animated WebP/APNG/GIF | Same art as B | Whole animation decoded; hard to pause, seek or chain | Poor | Same as B | Rejected |
| D. WebM video with alpha | Same art as B | Decoder overhead; transitions awkward | Poor | Same as B | Rejected |
| E. Lottie (vector) | Poor for painterly/3D look | Moderate | Good | Medium | Rejected |
| F. Skeletal runtime (Spine, Rive, Live2D) | Good for 2D rigs, not for baked 3D look | Moderate (runtime and licence costs unverified) | Good (Rive has state machines) | Medium-high; licensing to verify | Later option |
| G. Real-time 3D (three.js etc.) | Highest flexibility | Highest, plus complexity | Full | Highest | Rejected (no compelling reason) |

**Recommendation: B.** Pre-rendered transparent sprite atlases played by a small canvas (or CSS) player, driven by a manifest and a state machine. Frames come from ONE master source so identity cannot drift: a 3D model rendered from a fixed camera and lighting (matches the "premium cute 3D" references and needs no runtime 3D engine), or a hand-drawn master by an artist. Generating each pose independently with an image model is NOT acceptable as the production pipeline because of identity drift; AI may help concept work only.

**Asset specification (proposed; to be validated in the spike):**
- Format: lossless or near-lossless WebP with alpha (PNG fallback). Decoded memory is the same regardless of format, so format affects disk and load time, not RAM.
- Canvas per frame: 360 x 390 px (1.5x of a 240 x 260 logical box; good at 100-150% scaling, slightly soft at 200%). Decoded cost: 360 x 390 x 4 bytes = about 0.54 MB per frame (240x260 = 0.25 MB; 480x520 = 0.95 MB).
- Window stays 220 x 240 logical; the character must fit with padding for glow and cape; no clipping at any frame edge.
- Atlas layout: grid per clip, each atlas at most 4096 x 4096 px; trimmed with fixed anchor/pivot (feet) identical across clips.
- Alpha: test edges and glow on light AND dark desktops (premultiplied-alpha halos); keep glow subtle.
- Frame counts and rates (starting point): idle 12 frames loop at 8-12 fps; react/hover 6 one-shot; hop 10 one-shot; drag-held pose 1-4 loop; walk 8 loop (mirrored for left/right); sleep-enter 8 one-shot then sleep loop 8 at a low rate; wake 6 one-shot.
- Resident budget (estimate): idle + hop + drag = about 28 frames, roughly 15 MB decoded; other clips load on demand and unload. Target: whole-tree private memory stays near or below about 110 MB (baseline about 75 MB idle) and idle CPU no worse than the current CSS placeholder (about 1.5%). These targets are proposals for the user to confirm.

**Animation architecture:**
- `src/character/nova/manifest.json` describes clips: id, atlas file, frame size, frame count, fps, loop, pivot, priority, next state, tags. One manifest per character pack so more characters or actions are added by data, not code.
- State machine: idle, hover/react, hop (click), drag-held, walk, sleep, wake. One-shot clips return to idle; sleep triggered by an inactivity timer; any input wakes. Higher-priority states interrupt lower ones (this also removes the 600 ms timer hazard noted above).
- Player: draws only when the frame index changes (not every display frame); pauses entirely when the window is hidden (hide/show is done in Rust, so emit an explicit event rather than rely on page visibility, whose behaviour for `hide()` is unverified); lowest fps in sleep.
- Existing behaviour preserved: mouse handlers, `startDragging()`, tray, single-instance and window config are untouched; only the `.nova` placeholder is replaced by a `<NovaSprite>` component inside the same `.stage`. Transparent pixels inside the window still receive clicks (alpha-mask hit-testing is out of scope).
- Movement (walking across the desktop): animate in place first. Moving the window itself (`setPosition` at a low rate) is a separate spike because its cost is untested.

**Sequenced plan (small gates; each ends with a user test):**
0. Decide: canonical design and proportions; production pipeline (3D render vs hand-drawn); confirm budgets. No code.
1. Art: character sheet (turnaround, expression and palette) approved before any animation frames.
2. Technical spike with PLACEHOLDER frames (generated, no final art): player, manifest, state machine, idle to hop to idle, drag pose. Measure CPU/RAM with `tools/measure-nova.ps1` against the budgets above.
3. Real idle + hop + hover clips; full regression (drag, click, tray, hide/show, quit, single-instance).
4. Drag-held pose; sleep and wake on inactivity.
5. Walk/movement spike (window motion cost).
6. Further actions (app launching, focus session, celebrate) only after the above, as separate scoped tasks.

Out of scope throughout: AI chatbot, voice, marketplace, cloud backend, wallpaper transitions and desktop masking.

### Step 0 decisions (user-approved 15 November 2026)

1. **Canonical character:** the cute chibi concept (headphones, N emblem, dark navy suit, electric-blue glowing details, blue cape, expressive eyes). The adult helmeted turnaround is NOT canonical; only its turnaround-sheet layout and palette ideas may be borrowed. Nova's identity must not drift toward it.
2. **Approach:** pre-rendered sprite atlases with a lightweight canvas player.
3. **Pipeline:** one consistent master model or master artwork produces every pose and frame. No independent per-pose AI generation.
4. **Performance:** the 110 MB whole-tree figure is an initial target, not a guaranteed budget. Compare idle and animated CPU under equivalent conditions against existing measurements and record actuals before deciding on optimisation. NOTE: the existing figures (idle 1.50% CPU / 74.9 MB; animated 2.07% / 88.2 MB) were taken WITH the debug panel present. A fresh baseline of the cleaned release build (same script, same durations; animated = one click about every 0.7 s; also hidden) is required before comparing.
5. **Architecture:** manifest-driven animation state machine approved in principle; the existing overlay interaction logic (drag, click, tray, single-instance) stays isolated from the character renderer.
6. **Scope of first implementation:** idle, hop and react only. No walking or complex actions.

**RELEASE GATE: implementation is NOT authorised until the user has completed and confirmed the six-point release regression. Regression results: not yet received.**

### Reference inventory (`reference/`, inspected 15 November 2026)

11 files inspected: r01 and r02 viewed at full size; r03-r11 viewed only as downsized thumbnails on a contact sheet (character identification is from costume/artwork, not file metadata).

| File (start of name) | Size | Contents | Matches canonical Nova? |
|---|---|---|---|
| `2348286d-ee1d-...png` | 1536x1024 | Nova character sheet: chibi hero, headphones, N emblem, navy/black suit with glowing blue lines, blue cape; expressions Idle / Excited / Focused; poses wave, arms crossed, peeking, sleeping; 5-colour palette | YES (canonical) |
| `abb3312a-19a1-...png` | 1536x1024 | Six-scene experience sheet with the same character (appears, interacts, launches app, celebrates, helps, sleeps) | YES (canonical product experience) |
| `448tX2Hboa3_...jpg` | 1280x720 | Dark sci-fi control room with holographic panels; no character | No (environment mood) |
| `7D2S76KeE_...jpg` | 940x588 | Armoured/helmeted figure in a foggy hangar cell | No (mood) |
| `9hIVUnY7...jpg` | 710x444 | Superman (DC) artwork over a night city | No; copyrighted character |
| `EKTKX3Zg...jpg` | 1220x655 | Spider-Man (Marvel) art on a desktop with date and dock widgets | No; desktop-layout idea only; copyrighted |
| `jOntZvo_...jpg` | 2560x1440 | Spider-Man 2099-style (Marvel) in a rainy neon city | No; wallpaper mood; copyrighted |
| `KdTFMfsB...jpg` | 1920x1088 | Sci-fi lab with a suit in a capsule | No (environment mood) |
| `McAoEMOV...jpg` | 3840x2160 | Dark sci-fi interior with a hooded figure | No (environment mood) |
| `UHfPK0O3...jpg` | 1024x579 | Windows desktop with Rainmeter-style HUD, calendar and Miles Morales art | No; desktop-widget idea only; copyrighted |
| `ZIyopIip...jpg` | 5120x2880 | Spider-Man 2099-style (Marvel) artwork | No; wallpaper mood; copyrighted |

Only the first two match the canonical direction. The other nine are live-wallpaper/desktop-theme moodboard material for a future, out-of-scope milestone. They contain Marvel and DC characters: do not use them as Nova assets or copy their characters or costumes.

### Asset and manifest specification v2 (supersedes the numbers in the proposal above; PROPOSED, to be validated in the spike; not implemented)

**Correction:** the earlier 360x390 frame size (logical 240x260) was larger than the 220x240 window. Frames now match the window exactly.

- **Window and frame:** window 220x240 logical. Frame = full window: 330x360 px (1.5x). 1.5x is 1:1 at 150% scaling and downscales at 100%/125%. Render a 3x master (660x720) and downsample with a high-quality filter (premultiplied-alpha space), then store straight alpha. Keep a 2x/3x master for future use.
- **Layout inside the frame (logical px):** feet anchor at x=110, y=224 (= px 165, 336 at 1.5x). Standing character at most 150 high and 150 wide including cape; hop apex at most 44 above rest; at least 8 px (at 1.5x scale) fully transparent border on every frame; glow stays inside this margin.
- **Atlas:** one WebP per clip (lossless, alpha), row-major grid, 4 columns, no gutter (transparent borders prevent bleed), at most 4096 px per side. idle 12 frames = 1320x1080; hop 10 frames (2 empty slots) = 1320x1080; react 6 frames = 1320x720.
- **Decoded memory (estimate):** per atlas 5.70 MB + 5.70 MB + 3.80 MB = about 15.2 MB for all three resident (frame size 330x360x4 = 0.475 MB). Format does not change decoded size.
- **File naming:** source frames `art/frames/<clip>/nova_<clip>_NNNN.png` (4-digit, 1-based, playback order); built atlases `app/src/character/nova/atlases/<clip>.webp`; manifest `app/src/character/nova/manifest.json`.
- **Manifest (schema 1):** `character`, `version`, `logicalSize {w,h}`, `frameSize {w,h}`, `pixelRatio`, `anchor {x,y}` and `clips` map. Each clip has `atlas`, `columns`, `frames`, `fps`, optional per-frame `durations` (ms) for holds such as anticipation, `loop`, `priority`, `next` (state after a one-shot) and `retrigger` (`ignore` | `restart` | `queue`). An `events` map gives `from` states and the `to` state. Initial events: `hoverEnter` (idle to react), `click` (idle or react to hop), `hide`, `show`.
- **Initial clips:** idle (12 frames, 10 fps, loop, priority 0); react (6, 12 fps, one-shot, priority 1, next idle); hop (10, 15 fps, one-shot, priority 2, next idle, retrigger `queue` so a second click within the hop is not silently lost). Proposed mapping from the concept sheet: idle = standing hand-on-hip hero stance with breathing and cape sway; react = wave; hop = the Excited jump. To confirm with the user.
- **Authoring rules:** one master model or artwork; fixed camera and lighting; identical anchor in every clip; first and last frame of one-shot clips match idle frame 1 so the cut back to idle is seamless (no blending); palette taken from the sheet swatches; glow colours limited to that palette; check edges on white, mid-grey and black desktops.

**Runtime behaviour (design):**
- **Transparency:** page background stays transparent (already verified for DOM). The canvas uses an alpha backing store and is cleared before each draw. Transparent canvas pixels over the desktop are NOT yet verified; this is a spike gate.
- **Backing size:** logical size x devicePixelRatio, never above the 330x360 source; recompute on scale change (Tauri `onScaleChanged` is documented) and downscale with `imageSmoothingQuality = high`.
- **Frame timing:** clock from `performance.now()`; frame index = floor(elapsed x fps / 1000), modulo for loops; draw only when the index changes; schedule the next wake with `setTimeout` to the next frame boundary and draw inside one `requestAnimationFrame`, so there are no 60 Hz wake-ups at 10 fps. Late timers skip frames instead of drifting. Background throttling behaviour is unverified.
- **Transitions:** higher priority interrupts lower immediately; one-shots finish then follow `next`; same-priority behaviour per `retrigger`. A click during hop is queued once.
- **Pause/resume:** Rust emits a visibility event on tray Hide/Show and on a second-instance show; the player freezes its clock on hide (clears the timer, stores elapsed) and resumes from the same frame on show. The `emit` API call is to be checked against the docs for the installed Tauri version. Page visibility is only a secondary signal because its behaviour for `window.hide()` is unverified.
- **Isolation:** new folder `app/src/character/` (manifest, player, state machine, `<NovaSprite>`). `App.tsx` keeps its mouse handlers and only calls `novaRef.send(event)` (`click`, `hoverEnter`, `hoverLeave`); the sprite never calls window APIs. Tray, single-instance, drag and window config are untouched.

**Gates for the first technical spike (after the release gate):** transparent canvas verified over the desktop; idle CPU and whole-tree memory measured with `tools/measure-nova.ps1` against the fresh baseline; drag, click, tray, single-instance regression repeated. Optimise only if the measured numbers justify it.

## Phase 4 preparation: character integration (prepared 15 November 2026)

**STATUS: PLANNING ONLY. Not authorised to modify the working application, replace the placeholder or begin integration. Authorisation requires (a) the user's confirmed six-point release regression and (b) explicit approval of this plan. Nothing in this section has been implemented, built or measured.**

This section does not change any previously approved decision. Proposed revisions are listed separately in 4.9 and need approval.

### 4.1 Verified current architecture (read from the repository on 15 November 2026)

- **Placeholder rendering:** `src/App.tsx` renders a CSS-only character (`.nova` with `.cape`, `.body`, `.head`, `.eye` divs, 120x160 px, centred by flex inside `.stage`). The idle bob is a CSS keyframe (`idle`, 2.4 s, infinite); the click reaction is the CSS class `react` (keyframe `hop`, 0.6 s) toggled by React state plus one 600 ms `setTimeout`.
- **Input handling:** `onMouseDown`, `onMouseMove`, `onMouseUp` on `main.stage`, which fills the entire 220x240 window. Therefore EVERY pixel of the window, including transparent ones, starts a drag or a click (code reading; transparent-pixel event delivery has not been separately tested). Left button only. Press stores `screenX/screenY`; movement over 4 px clears the press and calls `getCurrentWindow().startDragging()`; mouse-up with the press intact counts as a click. There is no hover handling and no pointer-event CSS.
- **Tauri communication:** the frontend uses exactly one Tauri API, `startDragging()` from `@tauri-apps/api/window`. There are no `invoke` commands, no event listeners and no Rust-to-frontend events. `@tauri-apps/plugin-opener` is a declared dependency but unused in code.
- **Rust (`lib.rs`):** single-instance plugin first (shows the window if hidden, no focus), opener plugin, tray with `toggle` (show/hide via `is_visible()`) and `quit` (`app.exit(0)`). The frontend is never told when the window is hidden or shown.
- **Window and scaling:** `tauri.conf.json` window `main`: 220x240 logical px, transparent, no decorations, always-on-top, skipTaskbar, no shadow, not resizable, `center: true` (startup only; no position persistence). DPI is handled entirely by the webview (CSS px); no scale-handling code exists. Placeholder footprint: about x 50-170, y 40-200 logical.
- **Capabilities:** `core:default`, `core:window:allow-start-dragging`, `opener:default`, window `main`. Whether `core:default` already permits frontend `listen` for events is expected but NOT verified.
- **Build tooling:** React 19, Vite 8, TypeScript 6 with `strict`, `noUnusedLocals`, `noUnusedParameters` (new code must compile clean; this caused one failed build earlier), `resolveJsonModule: true`, `target ES2020`, `lib DOM`. Tauri 2.12.5 and single-instance 2.5.5 resolved. Frontend assets are embedded in the exe, so atlas size adds to exe size.
- **Other:** `index.html` still has the template title and `vite.svg` favicon (cosmetic, window title comes from config). The git commit status of the working tree is unknown to the assistant.

**Files that stay untouched:** `main.tsx`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `main.rs`, `build.rs`, `Cargo.toml`, `tauri.conf.json` (window settings), icons.
**Files expected to change:** `App.tsx` (swap placeholder for `<NovaSprite>`, replace the `reacting` state with `send(event)` calls; drag and click-arming logic kept), `App.css` (remove placeholder styles, add canvas style), `lib.rs` (additive: emit a visibility event from the tray toggle and the single-instance show), possibly `capabilities/default.json` (event permission, if `core:default` lacks it).
**New:** `src/character/` (renderer, state machine, hit mask, manifest, atlases), `art/` sources, `tools/pack-atlas` (see 4.2).

### 4.2 Asset pipeline (one master source; no production art yet)

**Canonical references (inspected):** the two Nova sheets in `reference/` (character sheet; six-scene sheet). The other nine files are wallpaper moodboard (five show Marvel/DC characters and are not to be used). Traits to preserve: large expressive blue eyes; spiky brown hair; glowing headphones; navy/black suit with electric-blue glowing lines (shoulders, belt, boots); glowing N chest emblem; blue cape with wavy hem; roughly 2.5-3 heads tall; palette of 5 swatches (cyan-blue, mid blue, light blue, purple, amber). The concept sheets are painted renders with bokeh backgrounds and some panel-to-panel variation (cape length, hair spike pattern, emblem glow), so they are references, not usable frames: the master must fix ONE canonical version of each.

**Master source requirements:**
- One rigged 3D model (recommended: matches the premium stylised look and guarantees consistency) OR one layered master illustration with a defined rig. Fixed identity: hair silhouette, headphone design, N emblem, suit line layout, cape length and hem, boot design, eye colour.
- Emissive materials for glow lines and emblem; glow added in render or compositing, confined to the safe margin.
- Cape and hair secondary motion simulated or hand-keyed in the source, baked into frames.
- Orthographic, fixed, front-facing camera for all clips (no perspective drift); the body may turn slightly. Root locked so the feet anchor does not wander.
- Lighting: one fixed rig for all clips: warm-neutral key from upper left, blue rim from behind-right, soft fill; no ground plane; no baked cast shadow (a very soft contact shadow at most 25% opacity may be a separate decision).
- Transparent background (RGBA). No background elements.

**Frame geometry (logical px unless noted; unchanged from approved spec v2):**
- Window 220x240 logical. Shipped frame 330x360 px (1.5x logical). Render master frames at 660x720 (3x logical = exactly 2x the shipped frame) and downsample 2:1 in premultiplied-alpha space; store straight alpha.
- Feet anchor: logical (110, 224) = shipped px (165, 336).
- Standing character at most 150 high and 150 wide including cape; hop apex at most 44 above rest; at least 8 shipped-px of fully transparent border on every frame.

**Atlas:** one lossless WebP per clip, 4 columns, row-major, no gutter. idle 12 frames = 1320x1080; hop 10 frames = 1320x1080; react 6 frames = 1320x720. Estimated decoded memory about 15.2 MB for all three. Compression: start with `cwebp -lossless -z 9`; compare `-near_lossless` only if sizes justify it by visual test. File sizes are unknown until real art exists.

**Naming:** source frames `art/frames/<clip>/nova_<clip>_NNNN.png` (1-based, 4 digits, playback order); atlases `src/character/nova/atlases/<clip>.webp`; manifest `src/character/nova/manifest.json`; hit mask data in the manifest (4.4).

**Manifest (schema 1):**
```json
{
  "schema": 1, "character": "nova", "version": "0.1.0",
  "logicalSize": {"w": 220, "h": 240}, "frameSize": {"w": 330, "h": 360},
  "anchor": {"x": 165, "y": 336},
  "clips": {
    "idle":  {"atlas": "atlases/idle.webp",  "columns": 4, "frames": 12, "fps": 10, "loop": true,  "priority": 0, "preload": true},
    "react": {"atlas": "atlases/react.webp", "columns": 4, "frames": 6,  "fps": 12, "loop": false, "priority": 1, "next": "idle", "interruptibleBy": ["hop"]},
    "hop":   {"atlas": "atlases/hop.webp",   "columns": 4, "frames": 10, "fps": 15, "loop": false, "priority": 2, "next": "idle", "retrigger": "queue"}
  },
  "events": {"click": "hop", "hoverEnter": "react"},
  "hit": {"w": 83, "h": 90, "alphaThreshold": 96, "dilate": 2, "data": "<base64 packed bits, union over all clips>"}
}
```
Optional per-clip `durations` (ms per frame) overrides `fps` for holds. The event-to-clip mapping is data, so the open decision D1 below is a manifest edit, not a code change. `tools/pack-atlas` (Python with Pillow, a development tool outside the app; needs approval, see D6) builds atlases, the manifest clip entries and the hit mask from the frame folders.

**Validation (run by the pack tool and reviewed visually):** every frame is exactly 660x720 at master and 330x360 shipped; transparent border at least 8 px; shipped bounding box within the 150x150 standing envelope and the hop apex limit; feet-anchor centroid drift at most 1 shipped-px between frames of a clip except where the animation intentionally moves; idle loop seam (last frame to first) pixel difference at or below a threshold chosen against the real art; first and last frame of one-shot clips match idle frame 1 within the same threshold. Review aids: contact sheet, an onion-skin overlay for jitter, and a preview page showing the loop over white, mid-grey and black backgrounds. Check edge halos on all three.

### 4.3 Animation architecture (first release: idle, hop, react only)

**Modules (new, under `src/character/`):** `types.ts`; `manifest.ts` (typed import of `manifest.json`); `stateMachine.ts` (pure logic, no DOM); `player.ts` (canvas, clock, timers); `hitMask.ts`; `NovaSprite.tsx` (thin React wrapper exposing `send(event)`; no per-frame React state). The sprite never calls window APIs.

**Priorities and interruption:** idle 0 < react 1 < hop 2. A higher-priority event interrupts immediately (cut, no blending; art rule: one-shots start and end on the idle pose). A lower or equal priority event is ignored while a clip plays, except where `retrigger` says otherwise. Hop is not interruptible. React is interruptible only by hop.

**Rapid clicks:** a click in idle or react starts hop. A click during hop sets a single `queued` flag (maximum one); after hop ends the queued hop plays once, further clicks while queued are dropped. This replaces the 600 ms timer, which cannot restart the visual on a second click. Hover-triggered react has a cooldown (proposed 1.5 s) so edge jitter cannot spam it.

**Idle resume:** a finished one-shot follows `next` and idle restarts at frame 0 (the art guarantees a matching pose).

**Dragging:** a drag clears the pending press (existing behaviour), sends `dragStart`, and the state machine ignores hover and click while `dragging`. Playback is otherwise unchanged in the first release (a running hop finishes; idle continues). Native drag swallows the mouse-up, so the end of a drag must be inferred. Candidate signals: a `mousemove` with `buttons === 0`; Tauri `onMoved` going quiet for about 200 ms. Which signals actually arrive is UNVERIFIED and is a spike question.

**Hidden pause/resume:** the tray toggle and the single-instance show are done in Rust, and the page currently gets no signal. Plan: add one small Rust helper used by both paths that shows or hides the window and emits an event (proposed name `nova-visibility`, boolean payload; the `Emitter::emit` call and the frontend `listen` call are to be checked against docs for the installed versions). The player listens; on hide it stores elapsed time in the clip and clears timers; on show it resets its start time so the clip continues from the same frame, then draws once. Page visibility (`visibilitychange`) is only a secondary signal because its behaviour for `window.hide()` is unverified.

**Timing:** clock from `performance.now()`; per clip store `startedAt`; frame = floor(elapsed / frameDuration) (or via a cumulative `durations` table), modulo for loops; a one-shot ends when elapsed reaches its total and then follows `next`. Scheduling: `setTimeout` to the next frame boundary; in the callback compute the frame and, only if it changed, draw once inside `requestAnimationFrame`. Late timers skip frames instead of drifting. Timer throttling in WebView2 when occluded or hidden is unverified (hidden is handled explicitly).

**Avoiding unnecessary redraws:** draw only on frame change or backing-size change (dedupe on clip, frame and size); no `requestAnimationFrame` loop; no React re-render per frame; nothing runs while hidden; pending timers are cleared on pause, on unmount and under React StrictMode's double mount in dev; atlas `ImageBitmap` objects are `close()`d when unloaded.

**Loading:** idle loads first and starts immediately; hop and react are prefetched during idle time right after the first frame, because they are primary click responses and a first-click decode stall must be avoided (this is my reading of "load secondary assets only when required"; see D5). Future clips (walk, sleep, wake) load on demand.

**Backing store and scale:** canvas CSS size 220x240; backing size = round(logical x devicePixelRatio), capped at 330x360; `imageSmoothingQuality = high`; recomputed on scale change (Tauri `onScaleChanged` is documented; `devicePixelRatio` change is the fallback). At 125% the 330 to 275 downscale is non-integer and may look slightly soft: a spike check, not a known defect.

**Out of the first implementation:** walking, sleep, wake, web-tether launches, celebrations, drag-held pose.

### 4.4 Interaction and hitbox design

**Problem confirmed from code:** the whole 220x240 window is interactive, but the character will cover only part of it. Transparent areas will start drags and clicks, and will also block clicks to whatever lies beneath the window.

**Proposed tiers:**
- **Tier 1 (recommended for the first integration):** precomputed hit mask in the JavaScript layer only. Window behaviour is unchanged.
  - Mask: the pack tool takes the union over a clip's frames of pixels with alpha at or above the threshold, shrinks it to 83x90 cells (1/4 scale), dilates by 2 cells (about 5 logical px) for forgiveness, and packs it as 1 bit per cell (about 934 bytes per clip). Lookup uses logical `clientX/clientY`, so it is independent of DPI and window size. Cape tips, headphones and boots are included automatically because the mask comes from the silhouette; faint glow is excluded by the 96/255 alpha threshold. Per-frame masks are a later refinement; the union of all clips is used first so the hop apex region remains clickable.
  - Drag: stays available from ANY pixel of the window (preserves today's behaviour and means Nova can never become undraggable).
  - Click, hop and react: the press must start on the mask AND the release must be on the mask; otherwise the click is ignored silently (no hop).
  - Hover: `mousemove` only updates an on-mask flag; `hoverEnter` fires on the transition off to on; the cursor style switches to `pointer` on the mask (DOM write only on change).
  - Drag versus hop: unchanged rule: crossing the 4 px threshold converts the press into a drag and clears the click; there is no hop after a drag. The threshold stays 4 px (the intermittent-click report was never reproduced, so it is not changed speculatively).
  - Clicks during animation: per the state machine in 4.3.
- **Tier 2 (separate later spike, not in the first release):** true click-through on transparent pixels by polling `cursorPosition()` and toggling `setIgnoreCursorEvents`. Earlier research found GitHub reports (issue 11461: not working on a child webview on Windows 10; issue 9250: page JavaScript only sees mouse events while the window has focus, which is why polling would be needed). Cost and reliability are unmeasured; may require native Win32 code. Its need depends on how much dead area the final art leaves.

**Known limitation of Tier 1:** transparent regions still block clicks to windows beneath Nova's 220x240 rectangle. How large the dead area is cannot be quantified until the final silhouette exists.

### 4.5 Performance and testing plan (targets are soft; no performance is claimed)

**Method:** `tools/measure-nova.ps1` (aggregates the app process and its WebView2 descendants; run by the user; 60 s per run; 3 runs per state; compare means with min to max ranges). The release build is measured, not `tauri dev`. Extra evidence per run: processes in tree, per-process breakdown (including the GPU process), exe size, atlas file sizes, time to first frame and idle-time decode duration (from a temporary console or log line in the spike build).

**Baseline first:** before any integration, measure the cleaned release build (idle visible, animated, hidden) with the same script. Existing numbers (idle 1.50% CPU, 74.9 MB; animated 2.07%, 88.2 MB) were taken with the debug panel present and are NOT the comparison baseline.

**States to measure:** (1) idle visible; (2) repeated animation: one click about every 1 s on the character; the automated driver is proposed as a Step E tool (a small PowerShell script that finds the window titled Nova and sends clicks at a fixed offset); manual clicking is the fallback; (3) dragging: continuous drag for 60 s; (4) hidden via tray; (5) startup (peak memory, time to first frame); (6) idle after 10 minutes (memory growth check).

**Soft targets (approved as initial, not guaranteed):** whole-tree idle memory at about 110 MB or less; idle CPU no worse than the cleaned baseline (investigate only if the integration mean exceeds the baseline's maximum); animated and dragging CPU recorded and compared with baseline, no fixed limit; no continuous rendering while idle beyond the 10 fps frame schedule, and none while hidden. Optimise only after measurement.

### 4.6 Gated implementation sequence

Prerequisite for all steps: confirmed release regression; the verified POC committed (the user's action) and tagged, with the character work on a separate branch so the release stays buildable; the baseline measurement recorded.

**Step A: master character artwork and turnaround.**
- Files: none in `app/`. Art sources under `art/` (outside the app).
- Acceptance: turnaround (front, 3/4, back, side), expression sheet and palette sheet approved by the user; master source passes the identity checklist in 4.2; one test render of the idle pose at 330x360 shown over white, mid-grey and black.
- Tests: visual review only.
- Risks: art production capacity and identity drift are the largest project risks; decide the producer in D3.
- Approval before Step B: user approves the master and turnaround.

**Step B: placeholder atlases and a minimal canvas renderer in an isolated spike (separate branch).**
- Files: new `src/character/*`, placeholder atlases and manifest, `tools/pack-atlas`; modified `App.tsx` and `App.css`; additive `lib.rs` (visibility event); `capabilities/default.json` only if needed. The placeholder atlases are generated shapes, not Nova art.
- Acceptance: idle loops, a click plays hop then returns to idle, hover plays react; hidden pause/resume works; state machine unit-checked on paper or with a small script; drag, tray and single-instance unchanged; `npm run tauri build` compiles clean under the strict TypeScript settings.
- Tests: automated compile (`tsc`, `vite build`, `cargo`); manual interaction run by the user.
- Risks: event permission for `listen`; transparent canvas halos; dragEnd detection; timer behaviour.
- Approval before Step C: user confirms the spike builds and the placeholder animation plays.

**Step C: verify transparent rendering, sizing, alignment and playback.**
- Files: none beyond fixes to the spike.
- Acceptance: canvas transparency shows the desktop with no box or halo on light and dark wallpapers; correct size at 100%, 125% and 150%; feet anchor stays still across the clip; no visible jitter; mask aligns with the drawn shape; cursor changes only on the character; drag-end signal chosen from measured evidence.
- Tests: user checklist (single monitor, three scales, light and dark wallpapers, hide and restore mid-animation, rapid clicks, drag then release); optional secondary monitor remains separate and untested.
- Risks: 125% softness; mask misalignment; event ordering on touchpads.
- Approval before Step D: user accepts rendering quality and the hit behaviour.

**Step D: integrate real idle, hop and react.**
- Files: real atlases, regenerated manifest and hit mask; `durations` tuned.
- Acceptance: all frames pass the validation in 4.2; loops and one-shot returns show no pop; identity matches the canonical sheets.
- Tests: pack-tool validation output plus visual review of the preview page.
- Risks: size of lossless atlases; seam pops.
- Approval before Step E: user approves the animations visually.

**Step E: interaction regression and performance.**
- Files: possibly `tools/click-driver.ps1`; otherwise none.
- Acceptance: the six-point release regression repeated plus 4.4 behaviours; measurements in 4.5 recorded in this file against the cleaned baseline.
- Tests: user-run regression; user-run measurement script; compare with baseline.
- Risks: CPU or memory above baseline (optimise only on evidence); decode spikes at startup.
- Approval before Step F: user reviews the numbers and accepts or requests optimisation.

**Step F: further states (walk, sleep and wake, drag-held pose, celebrations, tether launches).** Each is a separate scoped task with its own approval, only after A to E are stable.

### 4.7 Dependencies on the release regression

The six-point release regression was reported by the user as run and verified (individual results were not itemised to the assistant, and the Alt+Tab observation was not recorded). The block on Step B is lifted by the user's instruction. Step A (art) is still not started.

### 4.10 Step B progress: manifest and state machine (committed and pushed)

**Decisions applied from the user:** D1 option A is final: click = hop, hover-enter = react. Both are one-shots that return to idle. The mapping is enforced twice: the manifest validator rejects any other `events` mapping, and the state machine only reads the validated mapping.

**Files created (all new and untracked; no tracked file was modified):**
- `app/src/character/types.ts`: `ClipId` (idle, hop, react), `InteractionEvent` (click, hoverEnter), `ClipDef`, `CharacterManifest`, `MachineState`, hit-mask type.
- `app/src/character/manifest.ts`: `parseManifest(unknown)` (never throws, returns readable errors, ignores unknown clip ids and events, returns a normalised copy) and `REQUIRED_EVENT_MAP`.
- `app/src/character/stateMachine.ts`: pure `createInitialState`, `advance`, `send`, `clipDurationMs`. No React, DOM, timers or Tauri imports; time is passed in.
- `app/src/character/nova/manifest.json`: the three clips from section 4.2; `hoverCooldownMs: 1500` added to the manifest (not in the earlier sample) because the hover cooldown needs a configurable value.
- `app/tests/character/manifest.test.ts` and `app/tests/character/stateMachine.test.ts`.

**Behaviour implemented:** idle loops; hop and react return to idle at their exact end time; click interrupts react; hover never interrupts hop or react; a click during hop queues exactly one repeat; hover cooldown 1500 ms (a click does not start it; a backwards clock does not block it); unknown or non-string events, non-finite times, corrupted state, missing clips and unavailable clips (including a throwing availability check) are ignored safely or reset to idle. Not implemented in this task: dragging flags, hidden pause/resume, rendering, hit mask lookup, atlases. The Tauri window, drag logic, tray and single-instance code were not touched.

**Tests:** the repository has NO test framework (no test script, no Vitest or Jest in `package.json`). The tests use Node's built-in runner (`node:test`) with type stripping, so no dependency was added. They live in `app/tests/` (outside `src`, which `tsconfig.json` includes) so `npm run build` does not type-check them. Run from `app/` with Node 22.6 or newer: `node --experimental-strip-types --test tests/character/stateMachine.test.ts tests/character/manifest.test.ts`. Source imports use `.ts` extensions and `import type` (allowed by the existing `allowImportingTsExtensions` setting).

**Verification:**
- Assistant sandbox (Node v22.23.4): 51 tests pass, 0 fail; `tsc` 6.0.3 with the repository's strict options: no errors.
- User's machine (user-reported terminal output, Node v26.13.1): `node --experimental-strip-types --test tests/character/stateMachine.test.ts tests/character/manifest.test.ts` gave 51 tests, 12 suites, 51 pass, 0 fail. `npm run build` (`tsc && vite build`) succeeded (22 modules; JS 236.15 kB, CSS 1.20 kB).
- Not yet verified: runtime behaviour in the app (nothing in `App.tsx` uses the new code yet).

**Git (user-reported terminal output):** branch `feature/character-renderer-spike` created from `main` (7bceec0); commit `9720a03` "Add character manifest types and pure animation state machine" (7 files, 949 insertions, 1 deletion: the six new files plus `coordination.md`); pushed with upstream tracking to `origin/feature/character-renderer-spike`. Git printed LF-to-CRLF warnings, which are harmless line-ending notices. The push transferred 85 objects (5.86 MiB), far more than this commit's small text files; the cause was not checked (see the open question in the next section).

### 4.11 Step B progress: pure frame selection (written; NOT yet run by the user; NOT committed)

**Created (new files on branch `feature/character-renderer-spike`, uncommitted):**
- `app/src/character/framePlayer.ts`: pure `frameIndexAt`, `frameCell`, `atlasSize`, `backingSize`, `describeFrame`. No DOM, canvas, timers, React or Tauri imports. `describeFrame(manifest, state, now)` advances the state machine and returns the clip, frame, atlas source rectangle and `wakeInMs` (time to the next visible change, minimum 1 ms; one-shots on their last frame wake at the clip end). Loops wrap, one-shots hold the last frame, per-frame `durations` are honoured, corrupted state or time falls back to idle without throwing.
- `app/tests/character/framePlayer.test.ts`: 18 tests, including: atlas sizes equal the approved spec (idle 1320x1080, hop 1320x1080, react 1320x720); backing size 220x240 / 275x300 / 330x360 at 100% / 125% / 150% and capped at 330x360 above that; scheduling purely by `wakeInMs` visits every idle and hop frame in order with no skips or repeats.

**Verification (assistant sandbox only, Node v22.23.4, TypeScript 6.0.3):** all character tests 69 pass, 0 fail (51 earlier plus 18 new); `tsc` with the repository's strict options on `src` and on `src` plus `tests`: no errors. Not yet run on the user's machine.

**Still not implemented:** the canvas wrapper (drawing, `setTimeout` scheduling, image loading), hidden pause/resume wiring, hit mask lookup, placeholder atlases, `App.tsx` integration. `App.tsx` and all Tauri code remain unchanged.

### 4.8 Open decisions needed from the user

- **Repository hygiene (open question, unverified):** the first push of the feature branch moved 85 objects (5.86 MiB), which is more than this commit's small text files. Possible cause: earlier history that was never pushed, such as the images in `reference/`. `reference/` contains wallpapers with Marvel and DC characters and the concept sheets. Check with `git ls-files reference` whether they are tracked, and whether the GitHub repository is public. If it is public, copyrighted wallpapers should not be in it; ignore or remove that folder (a `.gitignore` entry plus `git rm --cached`) in a separate, user-approved change.
- **D1 click and hover mapping (RESOLVED: the user chose option A, click = hop and hover-enter = react; original conflict text follows):** the approved mapping was click = hop and hover = react. The Phase 4 brief says React is click-triggered and Hop a short reaction, while its hitbox section speaks of not accidentally triggering a hop while dragging. Options: A (recommended) click = hop, hover = react; B click = react, hop only after a drag drop or double-click; C click = hop then react chained. The mapping is a manifest edit.
- **D2 hit testing:** approve Tier 1 now (drag anywhere, click and hover on the silhouette) and defer Tier 2 click-through to a later spike?
- **D3 master source and producer:** 3D model (recommended) or hand-drawn master; who produces it, and the tools available.
- **D4 idle pose:** standing hand-on-hip hero stance (assumed) or seated.
- **D5 loading policy:** prefetch hop and react after the first idle frame (my proposal) or strictly on first use.
- **D6 tooling and git:** approve a Python and Pillow pack tool (development only, no app dependency; is Python installed?) and committing and tagging the POC on a branch before the spike.
- **D7 visibility event:** approve the small additive Rust change to emit visibility events from the tray toggle and the single-instance show.

### 4.9 Proposed revisions to earlier requirements (NOT applied; need approval)

- **R1 size envelope:** the approved 150 px standing-height limit is below the current placeholder's 160 px height (the placeholder is 120 wide). Proposal: allow up to 160 high and a 40 px hop apex, keeping at least a 24 px top margin. Keep 150 and 44 if you prefer.
- **R2 hit area:** the approved spec did not address transparent-pixel interactivity; code reading shows the whole window is interactive today. New requirement: 4.4 Tier 1.
- **R3 mapping:** see D1.
- **R4 loading:** see D5.
- No other approved decision is changed. Cosmetic: `index.html` still has the template title and favicon; left untouched.

## 11. Current milestone and exact next task

**Milestone 0 — Windows transparent-overlay feasibility**

The immediate task is research and a minimal implementation plan—not the complete application.

Claude must:
1. Read this document.
2. Inspect current official Tauri 2 documentation.
3. Evaluate the Windows-specific overlay risks listed above.
4. Propose the smallest proof of concept for a transparent, frameless, always-on-top, draggable window.
5. Explain the architecture, relevant APIs/configuration and implementation sequence.
6. Identify what must be tested manually on the target Windows machine.
7. Identify uncertainties and recommend a fallback only if justified.

Do not implement the complete companion, animations, application launcher, live wallpaper or masking effects during this task.

### Definition of done for the research task

- Official documentation links are provided.
- Windows-specific risks are explained.
- A minimal architecture and implementation plan are proposed.
- Unknowns and local tests are clearly identified.
- No out-of-scope features are introduced.

After reviewing the plan, the next task will be to build and test the smallest Windows overlay proof of concept.

## 12. Working principles

- One concrete task at a time.
- No restarting product ideation without a clear reason.
- No large feature expansion before the core prototype works.
- No unverified claims about code, files, tests, commits or pushes.
- Separate confirmed decisions from hypotheses and proposals.
- Prefer simple, maintainable engineering.
- Validate customer demand before substantial investment.
- Protect user privacy and employer confidentiality.
