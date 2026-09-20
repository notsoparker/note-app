#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::apply_native_window_style;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::apply_native_window_style;

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn apply_native_window_style(_window: &tauri::WebviewWindow) {}
