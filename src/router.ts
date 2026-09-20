// Register Views
import * as createNote from "./views/create-note";
import * as viewNote from "./views/view-note";

const views: Record<string, { render: () => string; init: () => void }> = {
    "create-note": { render: createNote.render, init: createNote.init },
    "view-note": { render: viewNote.render, init: viewNote.init },
};

// Mount Current View to Window
import { getCurrentWindow } from "@tauri-apps/api/window";

export function mountCurrentView() {
    const label = getCurrentWindow().label;
    const view = views[label];
    const app = document.querySelector<HTMLElement>("#app");
    if (!view || !app) return;

    app.innerHTML = view.render();
    view.init();
}

// Cross-View Navigation
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function goTo(label: string) {
    await getCurrentWindow().hide();
    const target = await WebviewWindow.getByLabel(label);
    await target?.show();
    await target?.setFocus();
}