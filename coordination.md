# NOVA — Project Coordination

**Last updated:** 15 November 2026  
**Project status:** Windows overlay POC built; six-point release regression and cleaned-build baseline pending; Phase 4 decisions approved  
**Repository:** KartikTotlani/Desktop_Companion (public GitHub repository; main is the only remotely listed branch)  
**Current milestone:** Complete final overlay regression and cleaned-build baseline; prepare Step A character production (no application-code changes yet)

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
| Canonical visual direction | Cute chibi original superhero: expressive eyes, headphones, N emblem, navy suit, electric-blue details and blue cape |
| Production approach | Consistent 3D master model rendered to 2D sprite atlases; Blender pipeline to investigate |
| Core appeal | Personality + useful superhero-themed interactions |
| Monetisation hypothesis | Paid base experience and optional packs |
| Development status | Windows overlay POC built; character renderer not started |

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

Current repository:
- KartikTotlani/Desktop_Companion (public as observed on 15 November 2026).
- Default branch: main; only remotely listed branch at the time of inspection.
- coordination.md is at the repository root.
- User intends to consider switching the repository to private; do not change visibility without explicit instruction.
- Keep README.md and .gitignore current; never commit secrets, API keys or credentials.
- Latest remote commit observed during this update: 7bceec0b280da31bd9abee4efe253f679e67ef20 (Update Desktop Companion, 15 November 2026).
- Remote GitHub state is visible; the user's local working-tree status cannot be inspected through this connector. The next local Claude/Opus session must run git status --short --branch, git log -1 --oneline and git remote -v before editing.

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
| GitHub repository | Exists; public; main branch observed |
| `coordination.md` in repository | Exists at repository root |
| Character renderer implementation | Blocked pending release regression and baseline; Step A art preparation may proceed |
| Windows overlay prototype | Built; six-point release regression pending |
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

### Phase 4 planning note

Earlier character-integration drafts below have been superseded by the approved requirements in Sections 4.8–4.14. Treat the approved sections as authoritative.

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

### Superseded technical drafts

The earlier proposed frame bounds, event mappings, loading sequence, hit-mask details and renderer architecture have been replaced by the approved Phase 4 requirements in Sections 4.8–4.14. Do not implement or rely on the superseded draft text.

### 4.8 Approved Phase 4 decisions (15 November 2026)

D1–D7 and the standing-height revision below are approved. They supersede earlier draft proposals and open questions in Sections 4.1–4.7. Do not ask the user to decide these again.

| Decision | Approved requirement |
|---|---|
| D1 — event mapping | Click = hop. Hover-enter = react. Manifest, state machine, hit testing and tests must all agree. Never implement click = react. |
| D2 — hit mask | Tier 1 character-shaped hit mask approved. Click and hover are limited to the silhouette. Dragging remains available anywhere in the current window. Defer OS click-through and complex pixel-perfect/per-frame hit testing. |
| D3 — master source | One consistent 3D master character model rendered into 2D sprite frames. Investigate Blender as the preferred production pipeline. No real-time 3D runtime in the application. First establish the design and assess practical modelling/rigging/rendering effort. AI concepting is allowed; production frames must preserve geometry and identity. |
| D4 — idle pose | Standing hero pose, one hand on hip. Keep chibi proportions, expressive eyes, recognisable cape and headphones. |
| D5 — loading | Make the first idle frame available and display it immediately. Only after that frame is available, preload hop and react. Load future animations only when required. |
| D6 — tooling and Git | Python + Pillow for a development-time atlas packer only. Check actual installed versions. Before the technical spike, verify the POC is committed and pushed, tag the stable POC commit and create a dedicated renderer-spike branch from it. Never rewrite or overwrite stable POC history. |
| D7 — visibility | A small Rust-side visibility signal is approved. Existing tray hide/show and single-instance restore must use an isolated shared visibility path so the frontend pauses while hidden and resumes when shown. Preserve tray behaviour. |
| Standing-height revision | Maximum standing height 160 logical px; hop displacement approximately 40 logical px. Keep the current 220 × 240 logical px window initially. Validate cape clearance and clipping before proposing any window-size change. |

#### 4.9 Step A — exact 3D master and asset-production requirements (may start now; no app code)

**Objective:** establish an approved, reproducible 3D Nova master in Blender (or document a justified alternative if Blender is unavailable or impractical), then deliver a turnaround and visual validation renders. Step A is art/design and tooling work only. Do not modify the Tauri/React/Rust application.

**First work package — design and feasibility:**
1. Inspect the two canonical Nova references at full resolution and extract an identity sheet: head/body ratio, face and eye design, hair silhouette, headphone shape, N emblem, suit panel/glow layout, cape shape, boots, palette and key proportions.
2. Check Blender availability and report the exact version. If unavailable, report that and compare a no-cost installation path with credible alternatives. Do not assume it is installed.
3. Assess modelling, topology, rigging, materials, cape/hair secondary motion, lighting, camera, render setup, animation blocking and iteration effort. Separate one-time setup from per-animation effort and provide a realistic time estimate.
4. Recommend the lowest-cost workflow that can reliably produce consistent frames. Do not purchase assets, subscribe to services or incur costs without approval.
5. Preserve the approved chibi identity. Surface any genuine design ambiguity rather than silently redesigning Nova.

**Master-model deliverables:**
- Editable Blender project with organised collections, named meshes/materials, camera, lights, rig and render settings.
- One reusable character model and rig for every view and clip; no independently generated pose models.
- Fixed identity anchors: head/eye proportions, hair silhouette, headphones, N emblem, suit-line placement, cape length/hem, gloves and boots.
- Materials for the navy suit, electric-blue details, emblem, eyes, hair, headphones and cape. Emission/glow must be controlled and not clip at frame edges.
- Stable orthographic camera and fixed lighting/render pipeline. Transparent RGBA background; no scene/background artwork baked into the sprite.
- Cape and hair motion must be controllable and repeatable (rigged or simulated and baked); no random per-render variation.
- Versioned source project and a short README recording Blender version, render settings and reproduction steps.

**Required Step A visual outputs:**
1. Turnaround: front, three-quarter, side and back views from the same model, consistent scale and neutral presentation.
2. Expression sheet: at minimum neutral/idle, excited and focused; preserve the expressive-eye design.
3. Palette/material sheet: named previews for suit, electric-blue details, cape, face/skin, hair and accessories.
4. Hero idle proof render: standing, one hand on hip, at intended in-window scale.
5. Transparent test render composited over white, mid-grey and black backgrounds to expose alpha fringes, glow halos and cape-edge problems.

**Animation-ready constraints:**
- Same rig, camera, lighting, materials, scale and root/feet anchor for every frame.
- Neutral standing idle is the reference pose. Hop and react must return cleanly to idle.
- No costume, emblem, facial, headphone, cape or proportion drift between clips.
- Feet/root alignment remains stable except for intentional hop displacement.
- Clean alpha; inspect edges on both light and dark backgrounds.

**Step A acceptance:** the user explicitly approves the 3D master, turnaround, expression sheet, palette and idle proof render. Do not produce the full animation atlases until that approval.

#### 4.10 Approved sprite and atlas constraints (after Step A approval)

- Runtime presentation: 2D sprite atlases rendered from the approved 3D master and played by a lightweight canvas renderer. Do not ship Blender or a 3D engine inside Nova.
- Initial logical window/canvas remains 220 × 240 px.
- Shipped frame: 330 × 360 px (1.5× logical). Render master at 660 × 720 px (3× logical), then downsample 2:1 with a high-quality filter in premultiplied-alpha space; store straight alpha.
- Standing character maximum: 160 logical px high and approximately 150 logical px wide including cape. Hop displacement: approximately 40 logical px upward. Preserve transparent edge padding where possible and validate cape/glow clearance against every frame edge. Do not resize the application window without approval.
- Keep a fixed feet/root anchor across frames and clips; measure its final coordinate from the approved model and record it in the manifest. Do not blindly retain an old anchor if the approved geometry requires adjustment.
- First production clips only: idle (12-frame loop), hop (10-frame one-shot), react (6-frame one-shot). FPS values are starting points to tune against actual motion, not user-approved fixed values.
- Preferred format: one transparent lossless WebP atlas per clip; PNG fallback if alpha/rendering causes issues. Four columns, row-major packing, no gutter, explicit frame dimensions/count, maximum atlas dimension 4096 px.
- Source frames: art/frames/<clip>/nova_<clip>_NNNN.png (1-based, four-digit sequence). Built atlases: app/src/character/nova/atlases/<clip>.webp. Manifest: app/src/character/nova/manifest.json.
- Validate frame dimensions, alpha, transparent border, feet-anchor drift, standing envelope, hop displacement, cape clearance, loop seam and one-shot return-to-idle seam. Produce a contact sheet, onion-skin/jitter review and previews over white, mid-grey and black.
- The three initial clips contain 28 frames total. At 330 × 360 RGBA this is approximately 12.7 MiB decoded before runtime overhead; measure actual process-tree memory.

#### 4.11 Manifest, hit-mask and state-machine contract

The manifest is the source of truth for event-to-clip mapping. Required mapping:

    events: click -> hop
    events: hoverEnter -> react

The final manifest also describes schema/version, character id, logical/frame dimensions, anchor, atlas paths, columns, frame counts, timing, loop/one-shot behaviour, priorities and next clip. Add a validation test that fails if click maps to react or hover maps to hop.

**Tier 1 hit mask:**
- Generate a coarse character-shaped mask from the union of idle, hop and react silhouettes. Use alpha thresholding and modest dilation for forgiving edges; document final resolution and parameters.
- Click/hop and hover/react fire only when the pointer is on the character mask, using logical coordinates so DPI scaling does not change hit results.
- Preserve drag initiation anywhere within the existing 220 × 240 window; a drag cancels the pending click/hop.
- Transparent areas outside the mask do not trigger character reactions but still block underlying window input because true click-through is deferred. Document this limitation.
- Do not implement OS-level click-through, per-frame pixel-perfect masks or native Win32 hit testing in this phase.

**State-machine contract:**
- Idle is the default loop.
- Click in idle/react starts hop; hop completes and returns to idle.
- Hover-enter from idle starts react; react completes and returns to idle.
- Click must never trigger react; hover must never trigger hop.
- Ignore hover/click events generated during an active drag.
- Define rapid-click/retrigger behaviour explicitly and test it. Do not carry the old 600 ms React timeout into the renderer. If choosing a one-click queue or cooldown, explain the trade-off and request approval if it changes the interaction feel.
- No walk, sleep, wake, drag-held, celebration or tether-launch clips in the first renderer implementation.

#### 4.12 Renderer implementation — what to start after the gates

**Do not start this implementation yet.** This is the first application-code task after the six-point release regression and cleaned-build baseline gate. It must run on a dedicated spike branch created from a tagged stable POC commit.

**Step B implementation scope (placeholder art only):**
1. Add isolated modules under app/src/character/:
   - types.ts: typed clip, frame, event and manifest contracts.
   - manifest.ts: load/validate manifest and enforce click → hop, hover-enter → react.
   - stateMachine.ts: pure transition logic, independent of React and Tauri.
   - player.ts: canvas drawing, frame clock, timer scheduling, pause/resume and asset lifecycle; redraw only on frame changes, no permanent RAF loop.
   - hitMask.ts: decode/query Tier 1 mask in logical coordinates.
   - NovaSprite.tsx: thin React wrapper; no React state update per animation frame and no direct window/tray APIs.
   - atlases/: generated placeholder atlases only, not final Nova art.
2. Add development-only tools/pack-atlas using Python and Pillow. It packs frames, generates the hit mask, validates dimensions/alpha/anchors and emits contact sheets/background previews. Python/Pillow must not become an app runtime dependency.
3. Integrate through the existing character stage in App.tsx/App.css, preserving current drag/click plumbing wherever possible. Do not rewrite the overlay or tray implementation.
4. Add one isolated Rust visibility helper/event in src-tauri/src/lib.rs (proposed event nova-visibility, payload { visible: boolean }). Route existing tray hide/show and single-instance restore through it so both emit the same signal. Preserve tray menu, icon, hide/show/quit semantics and single-instance behaviour. Confirm emitter/listener APIs and any required capability against installed Tauri versions before coding.
5. Frontend listens for visibility changes: hide pauses player and clears timers; show resumes from saved clip/frame position. Clean up listeners/timers on unmount and React StrictMode remount.
6. Keep changes additive and local to renderer/visibility boundary. No real-time 3D runtime, network calls, AI, voice, analytics, screen capture, keyboard monitoring or unrelated feature work.

**Step B acceptance:** placeholder idle loops; click plays hop then returns to idle; hover-enter plays react then returns to idle; Tier 1 mask behaves as specified; hide pauses and show resumes; drag remains reliable; tray and single-instance behaviour are unchanged; strict TypeScript/Vite/Rust release build passes. User performs manual runtime verification before Step C.

**Step C:** validate transparency, alpha edges on light/dark backgrounds, 100/125/150% DPI, stable anchor, no visible jitter, hit-mask alignment, drag/click separation and hide/show mid-animation.

**Step D:** replace placeholders with approved real idle/hop/react atlases from the Blender master; run packer validation and obtain user visual approval.

**Step E:** repeat overlay regression and measure the whole process tree against the cleaned-build baseline. Record startup/first-frame latency, idle-visible, animated, dragging and hidden states. Optimise only against measured regressions.

Later states and actions (walk, sleep/wake, drag-held, celebrations, tether launches and app launching) remain separate tasks after Steps A–E are stable.

#### 4.13 Tooling and Git requirements

**Local checks for the next Claude/Opus session:**
- Run python --version (or py --version) and report exact output.
- Run python -m pip show Pillow and a small import/version check: python -c "from PIL import Image; import PIL; print(PIL.__version__)". Report whether Pillow is installed and the exact version.
- Check Blender availability and exact version as part of Step A feasibility.
- Do not install packages or change the machine-wide environment without explaining the change and obtaining approval if it has a cost or broad impact.

**Before Step B:**
1. Run git status --short --branch, git log -1 --oneline and confirm the local POC working tree is clean.
2. Ensure all current POC source and lockfile changes are committed and pushed. Do not infer local cleanliness from GitHub.
3. Tag the exact stable POC commit (suggested annotated tag: poc-overlay-stable). If the tag already exists, inspect it; never move or overwrite it.
4. Create feature/character-renderer-spike from that exact tagged commit.
5. Confirm the branch starts at the tag's commit. Never force-push, reset, amend or rewrite stable POC history. Do not develop the renderer directly on main.

Remote observation during this update: repository KartikTotlani/Desktop_Companion is public; main is the only listed branch; latest remote commit observed was 7bceec0b280da31bd9abee4efe253f679e67ef20. This does not reveal the user's local working-tree state.

#### 4.14 Release regression gate and remaining decisions

**Hard gate before Step B or any application-code modification:** the user must confirm all six release-regression checks passed and provide cleaned-build whole-process-tree baseline measurements. Until then, no Step B code, renderer branch implementation or Rust visibility changes.

Six-point regression:
1. Launch the newest release executable and confirm transparent rendering.
2. Confirm drag and click behaviour.
3. Confirm tray Hide, Show and Quit.
4. Confirm no taskbar entry and record Alt+Tab behaviour.
5. Launch a second instance and confirm it restores the existing Nova rather than creating a duplicate.
6. Confirm Quit terminates the process.

The cleaned-build baseline must include idle-visible, animated and hidden whole-process-tree measurements using the same script/method. Record durations, sample count, CPU, private memory, process count and per-process breakdown. If hidden-state measurement cannot be made reliably, report the limitation rather than inventing a value.

**Remaining decisions/conflicts:** D1–D7 and standing-height are resolved. Two implementation details need evidence before coding: (a) exact Blender workflow/tool version and realistic effort estimate; (b) rapid-click behaviour during hop (ignore versus queue one). Do not silently choose either if it changes the user-visible interaction. Exact feet-anchor coordinates are measured from the approved final model, not guessed now.


## 11. Current milestone and exact next task

**Current milestone — close the overlay POC gate and begin Step A character production preparation.**

### Work allowed now (no application-code changes)
1. Read this coordination file and inspect the current repository state.
2. Check local Git branch, latest commit, remotes and working-tree status.
3. Check Python and Pillow availability and exact versions; check Blender availability and exact version.
4. Inspect the two canonical Nova references at full resolution and prepare the Step A identity/design sheet.
5. Assess the Blender master-model workflow, production effort, timeline and no-cost tooling. Prepare the exact Step A deliverables in Section 4.9.
6. Report conflicts, risks, tool availability and the recommended first modelling task. Do not purchase anything or install system-wide tools without approval.
7. Keep the current POC untouched. No application-code changes.

### Blocked until explicit user confirmation
- Step B renderer implementation.
- Any changes to App.tsx, App.css, lib.rs, Tauri configuration, capabilities or application dependencies.
- Creating the renderer-spike branch and starting code work before the six-point regression and cleaned-build baseline are confirmed.

### First implementation to start once the gate is cleared
Start Step B as an isolated placeholder-renderer spike on feature/character-renderer-spike, based on the tagged stable POC commit. Implement the exact module/file scope, atlas packer, Tier 1 hit mask, click → hop / hover-enter → react state machine and Rust visibility event described in Section 4.12. Use generated placeholder art only; do not integrate production Nova art until the placeholder renderer passes its build and manual acceptance checks.


## 12. Working principles

- One concrete task at a time.
- No restarting product ideation without a clear reason.
- No large feature expansion before the core prototype works.
- No unverified claims about code, files, tests, commits or pushes.
- Separate confirmed decisions from hypotheses and proposals.
- Prefer simple, maintainable engineering.
- Validate customer demand before substantial investment.
- Protect user privacy and employer confidentiality.
