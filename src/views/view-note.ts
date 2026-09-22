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

    const titleEl = document.querySelector<HTMLTextAreaElement>("#title-input");
    const bodyEl = document.querySelector<HTMLTextAreaElement>("#body-input");

    listen<NoteSavedPayload>("note-saved", (event) => {
        if (titleEl) titleEl.value = event.payload.title;
        if (bodyEl) bodyEl.value = "";
        getCurrentWindow().setTitle(event.payload.title);
    });

}