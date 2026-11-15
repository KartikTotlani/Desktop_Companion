# Task: Investigate Windows transparent-overlay feasibility for Nova

You are working on Nova, an original Windows-first desktop superhero companion.

## First: understand the project

1. Read the repository's `coordination.md` completely.
2. Read the `README.md` if present.
3. Inspect the existing repository structure and Git status.
4. Do not assume that the project has already been implemented.
5. Do not overwrite or remove existing work.

## Your task

Investigate whether Tauri 2 is a suitable foundation for a Windows desktop application with a transparent, frameless, always-on-top and draggable character overlay.

This is a feasibility investigation and implementation plan. **Do not implement the application yet.**

## 1. Inspect official documentation

Use current official Tauri 2 documentation as your primary source.

Investigate the relevant documentation and APIs for:

- Transparent windows.
- Frameless/decorations configuration.
- Always-on-top window behaviour.
- Window positioning and dragging.
- Window size and position management.
- Mouse events and interaction.
- Focus and activation behaviour.
- Multi-window considerations, if relevant.
- Windows-specific configuration and limitations.

Provide direct links to the documentation you rely on.

Do not invent API names or configuration options. If you cannot verify something in official documentation, label it as unverified.

## 2. Evaluate Windows-specific risks

Explain the likely implementation challenges for:

- Transparent backgrounds and rendering artefacts.
- Keeping Nova above ordinary application windows.
- Dragging Nova without accidentally moving or activating the wrong window.
- Mouse interaction and click-through behaviour.
- Focus stealing and keyboard focus.
- Multiple monitors.
- DPI scaling and display resolution changes.
- Fullscreen applications.
- Hide/show and reliable application exit.
- CPU and memory consumption.

Separate:
- Behaviour supported by documented Tauri capabilities.
- Behaviour that needs a local Windows proof of concept.
- Behaviour that may require Windows-specific native code.

## 3. Propose the smallest architecture

The provisional stack is:

- Tauri 2
- React
- TypeScript
- Rust

Propose the smallest architecture capable of displaying one movable character image or placeholder on a transparent desktop overlay.

Explain:
- Which responsibilities belong to the frontend.
- Which responsibilities belong to Tauri/Rust.
- Which window configuration is required.
- How dragging should work.
- How hide/show and quit should work.

Avoid unnecessary abstractions.

## 4. Define the proof-of-concept implementation sequence

Provide a numbered sequence of small steps.

The intended proof of concept should eventually demonstrate:

1. A transparent, frameless window.
2. Always-on-top behaviour.
3. A visible placeholder character.
4. Dragging the character around the desktop.
5. A basic click reaction.
6. Hide/show controls.
7. Reliable exit.

For this task, only describe the sequence. Do not implement it.

## 5. Define manual tests

Create a concise test checklist for a personal Windows machine.

Include:
- Normal desktop use.
- Several ordinary application windows.
- Dragging and clicking.
- Multiple monitors, if available.
- Different display scaling settings, if practical.
- Fullscreen application behaviour.
- Hide/show and exit.
- Basic resource usage.

For each test, state what success and failure would look like.

## 6. Assess alternatives only if necessary

Tauri 2 is the provisional choice.

Do not recommend switching frameworks merely because alternatives exist.

If you find a concrete limitation that makes Tauri unsuitable, explain:
- The exact limitation.
- The evidence.
- Whether a small Rust/Windows-native implementation could address it.
- Whether Electron or a native Windows application would be a better fallback.

## 7. Explicitly out of scope

Do not implement or design:

- Full character animation system.
- 3D rendering engine.
- AI or voice assistant.
- Notification reading or screen capture.
- Application launcher.
- Live wallpaper.
- Desktop masking effects.
- Marketplace or payment system.
- macOS support.
- Multi-character architecture.

These are not part of this feasibility task.

## 8. Required output

Return a concise technical report with these sections:

1. Feasibility verdict: suitable / suitable with caveats / unsuitable.
2. Official documentation references.
3. Recommended minimal architecture.
4. Windows-specific risks and unknowns.
5. Step-by-step proof-of-concept plan.
6. Manual test checklist.
7. Fallback recommendation, only if justified.
8. Exact next implementation task.

Be honest about uncertainty. Do not claim to have tested anything on Windows unless you actually did.

## 9. Repository and handoff rules

- Do not modify application code during this task.
- Do not install dependencies.
- Do not generate a large boilerplate project.
- Do not create unnecessary files.
- Do not commit or push anything.
- Do not claim tests were run when they were not.

At the end, tell me exactly what you inspected and what remains unverified.

The goal is to make an informed decision about the smallest reliable Windows overlay—not to build all of Nova in one session.


github - 
https://github.com/KartikTotlani/Desktop_Companion/tree/main 

also note chatgpt is your project manager so after each step build you need provide short summary what was done whats next item you targeting to i'll paste that to chatgpt
then if any suggestion from chatgpt or me i'll paste that here

