use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};

/// Global event telling the frontend whether Nova's window is visible (payload: bool),
/// so the animation can pause while hidden.
const VISIBILITY_EVENT: &str = "nova-visibility";

/// Show or hide the main window and notify the frontend. Does not take focus.
fn set_visible(app: &AppHandle, visible: bool) {
    if let Some(window) = app.get_webview_window("main") {
        let result = if visible { window.show() } else { window.hide() };
        if result.is_ok() {
            let _ = app.emit(VISIBILITY_EVENT, visible);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // Single instance: must be the first plugin registered.
    // A second launch shows the existing window if it is hidden; it does not take focus.
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                if !window.is_visible().unwrap_or(true) {
                    set_visible(app, true);
                }
            }
        }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Tray menu: the only way to show/hide/quit Nova (no taskbar-dependent controls).
            let toggle = MenuItem::with_id(app, "toggle", "Show / Hide Nova", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Nova", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Nova")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let visible = window.is_visible().unwrap_or(false);
                            set_visible(app, !visible);
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
