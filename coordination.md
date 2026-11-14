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
