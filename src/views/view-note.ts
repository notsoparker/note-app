import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

type NoteSavedPayload = { text: string; title: string };

export function render(): string {
    return `
    
        <!-- Background Container -->
        <div id="background">

            <!-- Note Container -->
            <div id="notecontainer">

                <!-- Note Title -->
                <div id="notetitle">
                    <textarea id="titleinput" spellcheck="false" rows="1" maxlength="75" placeholder="title"></textarea>
                    <button id="close-btn" class="btn-tlt btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
                    </button>
                </div>

                <!-- Infobar -->
                <div id="infobar">
                </div>

                <!-- Note Body -->
                <div id="notebody">
                    <textarea id="bodyinput" spellcheck="false" placeholder="start writing..."></textarea>
                </div>

                <!-- Toolbar -->
                <div id="toolbar">
                </div>

            </div>

        </div>

    `;
}

export function init() {

    // Init Constants
    const noteTitle = document.querySelector<HTMLElement>("#notetitle");
    const titleInput = document.querySelector<HTMLTextAreaElement>("#titleinput");
    const bodyInput = document.querySelector<HTMLTextAreaElement>("#bodyinput");
    const DRAG_THRESHOLD = 4;

    let closeBtn: HTMLButtonElement | null;

    // Functions

    // Title Drag
    function enableTitleDrag() {
        if (!noteTitle) return;

        noteTitle.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;

            if ((e.target as HTMLElement).closest("button")) return;

            const overInput = e.target === titleInput;
            if (overInput && document.activeElement === titleInput) return;

            const startX = e.clientX;
            const startY = e.clientY;

            const cleanup = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", cleanup);
            };

            const onMove = (moveEvent: MouseEvent) => {
                const dx = Math.abs(moveEvent.clientX - startX);
                const dy = Math.abs(moveEvent.clientY - startY);
                if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                    cleanup();
                    getCurrentWindow().startDragging();
                }
            };

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", cleanup);
        });
    }

    // Close Button
    async function closeNote() {
        await getCurrentWindow().close();
    }

    // Run Setup
    enableTitleDrag();

    // DOM Queries
    closeBtn = document.querySelector("#close-btn");

    // Listeners
    listen<NoteSavedPayload>("note-saved", (event) => {
        if (titleInput) titleInput.value = event.payload.title;
        if (bodyInput) bodyInput.value = "";
        getCurrentWindow().setTitle(event.payload.title);
    });

    closeBtn?.addEventListener("click", closeNote);
}