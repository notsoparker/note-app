import * as createNote from "./views/create-note";

const views: Record<string, { render: () => string; init: () => void }> = {
    "create-note": { render: createNote.render, init: createNote.init },
};

export function navigate(viewName: string) {
    const view = views[viewName];
    const app = document.querySelector<HTMLElement>("#app");
    if (!view || !app) return;

    app.innerHTML = view.render();
    view.init();
}