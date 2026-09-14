import { currentMonitor, getCurrentWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";

const MAX_NOTE_LENGTH = 75;
const NOTES_STORAGE_KEY = "note-app.notes";
const LIST_MARGIN = 20;

type ViewName = "new" | "note" | "list" | "settings";

interface Note {
  id: string;
  title: string;
  createdAt: string;
  pinned: boolean;
}

const VIEW_SIZES: Record<Exclude<ViewName, "new">, { width: number; height: number }> = {
  note: { width: 700, height: 450 },
  list: { width: 300, height: 800 },
  settings: { width: 700, height: 450 },
};

let notes: Note[] = loadNotes();
let activeNote: Note | null = null;
let currentView: ViewName = "new";

let noteEl: HTMLTextAreaElement | null;
let charCountEl: HTMLElement | null;
let actionBtn: HTMLButtonElement | null;
let actionIconList: SVGElement | null;
let actionIconSave: SVGElement | null;
let actionLabel: HTMLElement | null;
let settingsBtn: HTMLButtonElement | null;

let viewEls: Partial<Record<ViewName, HTMLElement>> = {};
let noteTitleEl: HTMLElement | null;
let noteCreatedEl: HTMLElement | null;
let notePinBtn: HTMLButtonElement | null = null;
let listRowsEl: HTMLElement | null;

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function persistNotes() {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function createNote(title: string): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  notes = [note, ...notes];
  persistNotes();
  return note;
}

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function resizeWindowToContent() {
  const width = Math.ceil(document.body.scrollWidth);
  const height = Math.ceil(document.body.scrollHeight);
  void getCurrentWindow().setSize(new LogicalSize(width, height));
}

function watchContentSize() {
  const observer = new ResizeObserver(() => {
    if (currentView === "new") resizeWindowToContent();
  });
  observer.observe(document.body);
}

async function positionListWindow(width: number, height: number) {
  const win = getCurrentWindow();
  const monitor = await currentMonitor();
  if (!monitor) return;
  const scale = monitor.scaleFactor;
  const monitorWidth = monitor.size.width / scale;
  const monitorHeight = monitor.size.height / scale;
  const monitorX = monitor.position.x / scale;
  const monitorY = monitor.position.y / scale;
  const x = monitorX + monitorWidth - width - LIST_MARGIN;
  const y = monitorY + (monitorHeight - height) / 2;
  await win.setPosition(new LogicalPosition(x, y));
}

async function applyWindowGeometry(view: ViewName) {
  const win = getCurrentWindow();
  if (view === "new") {
    resizeWindowToContent();
    await win.center();
    return;
  }

  const { width, height } = VIEW_SIZES[view];
  await win.setSize(new LogicalSize(width, height));

  if (view === "list") {
    await positionListWindow(width, height);
  } else {
    await win.center();
  }
}

function renderNoteView(note: Note) {
  if (!noteTitleEl || !noteCreatedEl) return;
  noteTitleEl.textContent = note.title;
  noteCreatedEl.textContent = formatCreatedDate(note.createdAt);
  notePinBtn?.classList.toggle("is-active", note.pinned);
}

function togglePin() {
  if (!activeNote) return;
  activeNote.pinned = !activeNote.pinned;
  notes = notes.map((n) => (n.id === activeNote?.id ? activeNote : n));
  persistNotes();
  notePinBtn?.classList.toggle("is-active", activeNote.pinned);
}

function renderListView() {
  if (!listRowsEl) return;
  listRowsEl.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = "No notes yet.";
    listRowsEl.appendChild(empty);
    return;
  }

  for (const note of notes) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "list-row";

    const title = document.createElement("span");
    title.className = "list-row-title";
    title.textContent = note.title;

    const date = document.createElement("span");
    date.className = "list-row-date";
    date.textContent = formatShortDate(note.createdAt);

    row.appendChild(title);
    row.appendChild(date);
    row.addEventListener("click", () => openNote(note));

    listRowsEl.appendChild(row);
  }
}

function showView(view: ViewName) {
  currentView = view;

  (Object.keys(viewEls) as ViewName[]).forEach((key) => {
    viewEls[key]?.toggleAttribute("hidden", key !== view);
  });

  if (view === "list") renderListView();

  void applyWindowGeometry(view);
}

function resetNewNoteForm() {
  if (!noteEl) return;
  noteEl.value = "";
  updateCharCount();
  updateActionButton();
}

function updateCharCount() {
  if (!noteEl || !charCountEl) return;
  const length = noteEl.value.length;
  charCountEl.textContent = `${length}`;
  charCountEl.classList.toggle("limit-reached", length >= MAX_NOTE_LENGTH);
}

function updateActionButton() {
  if (!actionBtn || !actionIconList || !actionIconSave || !actionLabel) return;

  const hasContent = (noteEl?.value.length ?? 0) > 0;

  actionBtn.classList.toggle("is-save", hasContent);

  actionIconList.toggleAttribute("hidden", hasContent);
  actionIconSave.toggleAttribute("hidden", !hasContent);

  actionLabel.textContent = hasContent ? "save" : "list";
  actionBtn.setAttribute("aria-label", hasContent ? "Save note" : "Show notes list");
}

function openNote(note: Note) {
  activeNote = note;
  renderNoteView(note);
  showView("note");
}

function saveNote() {
  if (!noteEl || noteEl.value.length === 0) return;
  const note = createNote(noteEl.value);
  resetNewNoteForm();
  openNote(note);
}

function openList() {
  showView("list");
}

function openSettings() {
  showView("settings");
}

function backToNew() {
  resetNewNoteForm();
  showView("new");
}

window.addEventListener("DOMContentLoaded", () => {
  noteEl = document.querySelector("#note");
  charCountEl = document.querySelector("#char-count");
  actionBtn = document.querySelector("#action-btn");
  actionIconList = document.querySelector("#action-btn .icon-list");
  actionIconSave = document.querySelector("#action-btn .icon-save");
  actionLabel = document.querySelector("#action-btn .btn-label");
  settingsBtn = document.querySelector("#settings-btn");

  viewEls = {
    new: document.querySelector("#view-new") ?? undefined,
    note: document.querySelector("#view-note") ?? undefined,
    list: document.querySelector("#view-list") ?? undefined,
    settings: document.querySelector("#view-settings") ?? undefined,
  };

  noteTitleEl = document.querySelector("#note-title");
  noteCreatedEl = document.querySelector("#note-created");
  notePinBtn = document.querySelector("#note-pin-btn");
  listRowsEl = document.querySelector("#list-rows");

  noteEl?.addEventListener("input", () => {
    updateCharCount();
    updateActionButton();
  });

  noteEl?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (noteEl && noteEl.value.length > 0) {
      saveNote();
    }
  });

  actionBtn?.addEventListener("click", () => {
    if (actionBtn?.classList.contains("is-save")) {
      saveNote();
    } else {
      openList();
    }
  });

  settingsBtn?.addEventListener("click", openSettings);

  document.querySelector("#note-new-btn")?.addEventListener("click", backToNew);
  document.querySelector("#note-close-btn")?.addEventListener("click", backToNew);
  notePinBtn?.addEventListener("click", togglePin);
  document.querySelector("#list-new-btn")?.addEventListener("click", backToNew);
  document.querySelector("#list-close-btn")?.addEventListener("click", backToNew);
  document.querySelector("#settings-close-btn")?.addEventListener("click", backToNew);

  updateCharCount();
  updateActionButton();
  watchContentSize();
  resizeWindowToContent();
});
