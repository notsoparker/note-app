const MAX_NOTE_LENGTH = 75;

let noteEl: HTMLTextAreaElement | null;
let charCountEl: HTMLElement | null;

function updateCharCount() {
  if (!noteEl || !charCountEl) return;
  const length = noteEl.value.length;
  charCountEl.textContent = `${length}`;
  charCountEl.classList.toggle("limit-reached", length >= MAX_NOTE_LENGTH);
}

window.addEventListener("DOMContentLoaded", () => {
  noteEl = document.querySelector("#textarea");
  charCountEl = document.querySelector("#char-count");
  noteEl?.addEventListener("input", updateCharCount);
  updateCharCount();
});