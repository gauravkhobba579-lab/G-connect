
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
/* डार्क मोड बटन की स्टाइल */
#theme-toggle {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 8px 14px;
    cursor: pointer;
    border-radius: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    font-weight: bold;
    z-index: 1000;
}

/* डार्क थीम एक्टिव होने पर रंगों में बदलाव */
body.dark-theme {
    background-color: #121212 !important;
    color: #ffffff !important;
}
body.dark-theme .card, 
body.dark-theme input, 
body.dark-theme textarea {
    background-color: #1e1e1e !important;
    color: #ffffff !important;
    border-color: #333 !important;
}
body.dark-theme #theme-toggle {
    background-color: #333;
    color: #fff;
    border-color: #555;
                     }
document.addEventListener("DOMContentLoaded", () => {
    const noteTitle = document.getElementById("note-title") || document.getElementById("title");
    const noteText = document.getElementById("note-text") || document.getElementById("content");
    const saveBtn = document.getElementById("save-btn") || document.getElementById("saveBtn");
    const clearBtn = document.getElementById("clear-btn") || document.getElementById("clearBtn");
    const searchNotes = document.getElementById("search-notes") || document.getElementById("search");
    const notesContainer = document.getElementById("notes-container") || document.getElementById("notes");
    const themeToggle = document.getElementById("theme-toggle");
    const downloadBtn = document.getElementById("download-btn") || document.getElementById("backupBtn");
    const restoreBtn = document.getElementById("restore-btn") || document.getElementById("restoreBtn");

    // लोकल स्टोरेज से रूटीन डेटा लोड करना
    let routines = JSON.parse(localStorage.getItem("g_daily_routine")) || [];

    // रूटीन लिस्ट को स्क्रीन पर रेंडर करना
    function renderRoutines(filter = "") {
        notesContainer.innerHTML = "";
        
        const filtered = routines.filter(item => 
            item.title.toLowerCase().includes(filter.toLowerCase()) || 
            item.content.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            notesContainer.innerHTML = '<p id="no-notes">कोई डेली रूटीन नहीं मिला। नया टास्क जोड़ें!</p>';
            return;
        }

        filtered.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = `routine-item ${item.completed ? 'completed' : ''}`;
            
            div.innerHTML = `
                <div class="routine-header">
                    <h3 class="routine-title">${item.title}</h3>
                    <span>${item.time || ''}</span>
                </div>
                <p class="routine-content">${item.content}</p>
                <div class="action-btns">
                    <button class="btn-task btn-complete" onclick="toggleComplete(${index})">
                        ${item.completed ? '✕ Undo' : '✓ Done'}
                    </button>
                    <button class="btn-task btn-delete" onclick="deleteRoutine(${index})">Delete</button>
                </div>
            `;
            notesContainer.appendChild(div);
        });
    }

    // नया रूटीन/टास्क जोड़ना
    saveBtn.addEventListener("click", () => {
        const title = noteTitle.value.trim();
        const content = noteText.value.trim();

        if (!title) {
            alert("कृपया रूटीन का नाम या समय (जैसे: Morning Routine) ज़रूर लिखें!");
            return;
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        routines.push({ 
            title, 
            content, 
            completed: false,
            time: currentTime 
        });

        saveAndRefresh();
        noteTitle.value = "";
        noteText.value = "";
    });

    // टास्क को डन (Complete) मार्क करना
    window.toggleComplete = (index) => {
        routines[index].completed = !routines[index].completed;
        saveAndRefresh();
    };

    // टास्क डिलीट करना
    window.deleteRoutine = (index) => {
        if(confirm("क्या आप इस टास्क को हटाना चाहते हैं?")) {
            routines.splice(index, 1);
            saveAndRefresh();
        }
    };

    // डेटा सेव और रिफ्रेश करने का कॉमन फंक्शन
    function saveAndRefresh() {
        localStorage.setItem("g_daily_routine", JSON.stringify(routines));
        renderRoutines(searchNotes ? searchNotes.value : "");
    }

    // इनपुट क्लियर बटन
    clearBtn.addEventListener("click", () => {
        noteTitle.value = "";
        noteText.value = "";
    });

    // रूटीन सर्च फ़िल्टर
    if(searchNotes) {
        searchNotes.addEventListener("input", (e) => {
            renderRoutines(e.target.value);
        });
    }

    // डार्क मोड / लाइट मोड थीम स्विच
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            if (currentTheme === "dark") {
                document.documentElement.setAttribute("data-theme", "light");
                themeToggle.textContent = "🌙 Dark Mode";
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                themeToggle.textContent = "☀️ Light Mode";
            }
        });
    }

    // रूटीन बैकअप डाउनलोड (JSON format)
    if(downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routines));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "daily_routine_backup.json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        });
    }

    // बैकअप फ़ाइल रीस्टोर करना
    if(restoreBtn) {
        restoreBtn.addEventListener("click", () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsText(file,'UTF-8');
                reader.onload = readerEvent => {
                    try {
                        const content = JSON.parse(readerEvent.target.result);
                        if (Array.isArray(content)) {
                            routines = content;
                            saveAndRefresh();
                            alert("आपका रूटीन बैकअप रीस्टोर हो गया है!");
                        } else {
                            alert("गलत फाइल फॉर्मेट!");
                        }
                    } catch (err) {
                        alert("फाइल लोड करने में एरर आई!");
                    }
                }
            }
            input.click();
        });
    }

    // पहली बार लोड होने पर लिस्ट दिखाना
    renderRoutines();
});
