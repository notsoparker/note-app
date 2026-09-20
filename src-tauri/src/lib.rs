mod platform;
mod notes;

use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {
    tauri::Builder::default()

        .plugin(tauri_plugin_opener::init())

        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        println!("Hotkey pressed: {:?}", shortcut);
                        if let Some(window) = app.get_webview_window("create-note") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(),
        )

        .setup(|app| {
            let shortcut = "CmdOrCtrl+/";
            app.global_shortcut().register(shortcut)?;

            for (_label, window) in app.webview_windows() {
                platform::apply_native_window_style(&window);

                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
            }

            if let Some(list_window) = app.get_webview_window("list-note") {
                if let Some(monitor) = list_window.current_monitor()? {
                    let screen_size = monitor.size();
                    let window_size = list_window.outer_size()?;
                    let x = screen_size.width as i32 - window_size.width as i32;
                    let y = (screen_size.height as i32 - window_size.height as i32) / 2;
                    list_window.set_position(tauri::PhysicalPosition::new(x, y))?;
                }
            }

            Ok(())
        })

        .invoke_handler(tauri::generate_handler![notes::save_note])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}