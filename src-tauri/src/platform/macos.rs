use cocoa::appkit::NSWindow;
use cocoa::base::id;
use objc::{msg_send, sel, sel_impl};

pub fn apply_native_window_style(window: &tauri::WebviewWindow) {
    let radius = 15.0;
    if let Ok(ns_window) = window.ns_window() {
        unsafe {
            let ns_window = ns_window as id;
            let content_view: id = ns_window.contentView();
            let _: () = msg_send![content_view, setWantsLayer: true];
            let layer: id = msg_send![content_view, layer];
            let _: () = msg_send![layer, setCornerRadius: radius];
            let _: () = msg_send![layer, setMasksToBounds: true];
        }
    }
}
