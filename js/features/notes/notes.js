import { getDatabase, ref, onValue, push, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db = getDatabase();
let subjectId = null;
let noteId = null;
let unsubscribe = null;
let saveTimer = null;

const $ = (s) => document.querySelector(s);
const uid = () => window.currentUser?.uid || window.auth?.currentUser?.uid || null;

const esc = (v="") => String(v).replace(/[&<>"']/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])
);

export function initNotes() {
  window.StudyDropNotes = { openSubject, createNote, saveNote, deleteNote, pinNote };

  document.addEventListener("click", e => {
    const s = e.target.closest("[data-notes-subject]");
    if (s) openSubject(s.dataset.notesSubject, s.dataset.subjectName || "Subject");

    if (e.target.closest("[data-notes-new]")) createNote();

    const n = e.target.closest("[data-note-id]");
    if (n) selectNote(n.dataset.noteId);

    const save = e.target.closest("[data-note-save]");
    if (save) saveNote();

    const del = e.target.closest("[data-note-current-delete]");
    if (del && noteId) deleteNote(noteId);

    const back = e.target.closest("[data-notes-back]");
    if (back) $("#notes-page")?.classList.add("hidden");
  });
}

export function openSubject(id, name="Subject") {
  subjectId = id;
  noteId = null;
  renderShell(name);
  $("#notes-page")?.classList.remove("hidden");
  listen();
}

function renderShell(name) {
  const page = $("#notes-page");
  if (!page) return;

  page.innerHTML = `
    <div class="notes-app">
      <header class="notes-header">
        <div>
          <button class="notes-back" data-notes-back>← Back</button>
          <h1>${esc(name)}</h1>
          <p>Your subject notebook</p>
        </div>
        <button class="notes-new-btn" data-notes-new>＋ New Note</button>
      </header>

      <div class="notes-workspace">
        <aside class="notes-list">
          <div class="notes-list-title">Notebook</div>
          <div id="notes-items"><div class="notes-no-items">Loading…</div></div>
        </aside>

        <main class="note-editor">
          <div id="note-empty" class="note-empty">
            <div>📖</div>
            <h2>Select or create a note</h2>
            <p>Your notes for this subject will appear here.</p>
            <button class="notes-new-btn" data-notes-new>＋ New Note</button>
          </div>

          <div id="note-form" class="note-form hidden">
            <input id="note-title" class="note-title-input" maxlength="120" placeholder="Note title">

            <div class="note-toolbar">
              <button type="button" data-format="bold"><b>B</b></button>
              <button type="button" data-format="italic"><i>I</i></button>
              <button type="button" data-format="underline"><u>U</u></button>
              <button type="button" data-format="insertUnorderedList">• List</button>
              <button type="button" data-format="insertOrderedList">1. List</button>
            </div>

            <div id="note-content" class="note-content" contenteditable="true"
                 data-placeholder="Start writing your notes…"></div>

            <div class="note-footer">
              <span id="note-save-status">Saved</span>
              <div>
                <button class="notes-danger" data-note-current-delete>Delete</button>
                <button class="notes-save" data-note-save>Save</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>`;

  page.querySelectorAll("[data-format]").forEach(b => {
    b.addEventListener("click", () => {
      document.execCommand(b.dataset.format, false);
      $("#note-content")?.focus();
    });
  });

  $("#note-title")?.addEventListener("input", autosave);
  $("#note-content")?.addEventListener("input", autosave);
}

function listen() {
  if (!uid() || !subjectId) return;
  if (unsubscribe) unsubscribe();

  unsubscribe = onValue(ref(db, `notes/${uid()}/${subjectId}`), snap => {
    const data = snap.val() || {};
    const notes = Object.entries(data)
      .map(([id,n]) => ({id,...n}))
      .sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));

    renderList(notes);
    if (noteId) {
      const current = notes.find(n => n.id === noteId);
      if (current) showEditor(current);
    }
  });
}

function renderList(notes) {
  const el = $("#notes-items");
  if (!el) return;

  if (!notes.length) {
    el.innerHTML = `<div class="notes-no-items">No notes yet.</div>`;
    return;
  }

  el.innerHTML = notes.map(n => `
    <button class="note-list-item ${n.id===noteId ? "active":""}" data-note-id="${esc(n.id)}">
      <span>${n.pinned ? "📌" : "📄"}</span>
      <span>
        <strong>${esc(n.title || "Untitled note")}</strong>
        <small>${new Date(n.updatedAt || Date.now()).toLocaleDateString()}</small>
      </span>
    </button>`).join("");
}

export async function createNote() {
  if (!uid() || !subjectId) return;

  const r = push(ref(db, `notes/${uid()}/${subjectId}`));
  await set(r, {
    title: "Untitled note",
    content: "",
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  noteId = r.key;
  listen();
}

function selectNote(id) {
  noteId = id;
  onValue(ref(db, `notes/${uid()}/${subjectId}/${id}`), snap => {
    if (snap.exists()) showEditor({id, ...snap.val()});
  }, {onlyOnce:true});
}

function showEditor(note) {
  $("#note-empty")?.classList.add("hidden");
  $("#note-form")?.classList.remove("hidden");
  $("#note-title").value = note.title || "";
  $("#note-content").innerHTML = note.content || "";
  $("#note-save-status").textContent = "Saved ✓";
  document.querySelectorAll(".note-list-item").forEach(x =>
    x.classList.toggle("active", x.dataset.noteId === note.id));
}

function autosave() {
  $("#note-save-status").textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNote, 700);
}

export async function saveNote() {
  if (!uid() || !subjectId || !noteId) return;

  await update(ref(db, `notes/${uid()}/${subjectId}/${noteId}`), {
    title: ($("#note-title")?.value || "Untitled note").trim().slice(0,120) || "Untitled note",
    content: $("#note-content")?.innerHTML || "",
    updatedAt: Date.now()
  });

  $("#note-save-status").textContent = "Saved ✓";
}

export async function deleteNote(id) {
  if (!uid() || !subjectId || !id) return;
  if (!confirm("Delete this note?")) return;

  await remove(ref(db, `notes/${uid()}/${subjectId}/${id}`));

  if (noteId === id) {
    noteId = null;
    $("#note-form")?.classList.add("hidden");
    $("#note-empty")?.classList.remove("hidden");
  }
}

export async function pinNote(id) {
  const r = ref(db, `notes/${uid()}/${subjectId}/${id}`);
  onValue(r, snap => {
    if (snap.exists()) update(r, { pinned: !snap.val().pinned, updatedAt: Date.now() });
  }, {onlyOnce:true});
}
