
const STORAGE_KEY = "myNotes";

let notes = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

let editingId = null;

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesBox = document.getElementById("notes");
const searchInput = document.getElementById("search");

// Save notes
function saveNote() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title && !content) {
    alert("Please write something!");
    return;
  }

  if (editingId !== null) {
    const note = notes.find(n => n.id === editingId);

    if (note) {
      note.title = title || "Untitled";
      note.content = content;
    }
  } else {
    notes.unshift({
      id: Date.now(),
      title: title || "Untitled",
      content: content,
      date: new Date().toLocaleString()
    });
  }

  saveData();
  clearForm();
}

// Store in phone browser
function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );

  showNotes();
}

// Display notes
function showNotes() {
  const search = searchInput.value.toLowerCase();

  notesBox.innerHTML = "";

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search) ||
    n.content.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    notesBox.textContent = "No notes found.";
    return;
  }

  filtered.forEach(note => {
    const card = document.createElement("div");
    card.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = note.title;

    const paragraph = document.createElement("p");
    paragraph.textContent = note.content;

    const date = document.createElement("small");
    date.textContent = note.date || "";

    const edit = document.createElement("button");
    edit.className = "secondary";
    edit.textContent = "Edit";

    edit.onclick = () => {
      titleInput.value = note.title;
      contentInput.value = note.content;
      editingId = note.id;

      document.getElementById("editorHeading")
        .textContent = "Edit Note";

      document.getElementById("saveBtn")
        .textContent = "Update Note";

      window.scrollTo(0, 0);
    };

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";

    del.onclick = () => {
      if (confirm("Delete this note?")) {
        notes = notes.filter(n => n.id !== note.id);
        saveData();
      }
    };

    card.append(heading, paragraph, date, edit, del);
    notesBox.appendChild(card);
  });
}

// Clear form
function clearForm() {
  titleInput.value = "";
  contentInput.value = "";
  editingId = null;

  document.getElementById("editorHeading")
    .textContent = "Create Note";

  document.getElementById("saveBtn")
    .textContent = "Save Note";
}

// Download backup
function backupNotes() {
  const blob = new Blob(
    [JSON.stringify(notes, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "my-notes-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Restore backup
function restoreNotes(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!Array.isArray(data)) {
        throw new Error("Invalid backup");
      }

      if (confirm("Restore these notes?")) {
        data.forEach(item => {
          notes.unshift({
            id: Date.now() + Math.random(),
            title: String(item.title || "Untitled"),
            content: String(item.content || ""),
            date: item.date || new Date().toLocaleString()
          });
        });

        saveData();
        alert("Backup restored!");
      }
    } catch (error) {
      alert("Invalid backup file!");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

// Button events
document.getElementById("saveBtn")
  .addEventListener("click", saveNote);

document.getElementById("clearBtn")
  .addEventListener("click", clearForm);

document.getElementById("backupBtn")
  .addEventListener("click", backupNotes);

document.getElementById("restoreBtn")
  .addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });

document.getElementById("fileInput")
  .addEventListener("change", restoreNotes);

searchInput.addEventListener("input", showNotes);

// Start app
showNotes();
