const MAX_NOTE_LENGTH = 75;

let noteEl: HTMLTextAreaElement | null;
let charCountEl: HTMLElement | null;
let saveBtnEl: HTMLButtonElement | null;
let listBtnEl: HTMLButtonElement | null;

function updateListSaveButtonState() {
  if (!noteEl || !saveBtnEl || !listBtnEl) return;
  const hasText = noteEl.value.trim().length > 0;
  saveBtnEl.hidden = !hasText;
  listBtnEl.hidden = hasText;
}

function updateCharCount() {
  if (!noteEl || !charCountEl) return;
  const length = noteEl.value.length;
  charCountEl.textContent = `${length}`;
  charCountEl.classList.toggle("limit-reached", length >= MAX_NOTE_LENGTH);
}

window.addEventListener("DOMContentLoaded", () => {
  noteEl = document.querySelector("#textarea");
  charCountEl = document.querySelector("#char-count");
  saveBtnEl = document.querySelector("#save-btn");
  listBtnEl = document.querySelector("#list-btn");

  noteEl?.addEventListener("input", () => {
    updateCharCount();
    updateListSaveButtonState();
  });

  updateCharCount();
  updateListSaveButtonState();
});