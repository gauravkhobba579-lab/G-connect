document.addEventListener("DOMContentLoaded", () => {
    // PWA सर्विस वर्कर रजिस्ट्रेशन
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("Service Worker Registered"));
    }

    const noteTitle = document.getElementById("title") || document.getElementById("note-title");
    const noteText = document.getElementById("content") || document.getElementById("note-text");
    const saveBtn = document.getElementById("saveBtn") || document.getElementById("save-btn");
    const clearBtn = document.getElementById("clearBtn") || document.getElementById("clear-btn");
    const searchInput = document.getElementById("search") || document.getElementById("search-notes");
    const pinnedContainer = document.getElementById("pinned-notes");
    const allNotesContainer = document.getElementById("all-notes");
    const themeToggle = document.getElementById("theme-toggle");
    const downloadBtn = document.getElementById("backupBtn") || document.getElementById("download-btn");
    const restoreBtn = document.getElementById("restoreBtn") || document.getElementById("restore-btn");
    const installBanner = document.getElementById("install-banner");
    const installBtn = document.getElementById("install-btn");

    let notes = JSON.parse(localStorage.getItem("g_pwa_notes")) || [];
    let deferredPrompt;

    // डाउनलोड/इंस्टॉल बैनर लॉजिक
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if(installBanner) installBanner.style.display = 'flex';
    });

    if(installBtn) {
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        if(installBanner) installBanner.style.display = 'none';
                    }
                    deferredPrompt = null;
                });
            }
        });
    }

    // नोट्स को रेंडर करना
    function renderNotes() {
        if(!allNotesContainer) return;
        
        pinnedContainer.innerHTML = "";
        allNotesContainer.innerHTML = "";
        
        const filter = searchInput ? searchInput.value.toLowerCase() : "";
        let hasPinned = false;

        notes.forEach((note, index) => {
            if (note.title.toLowerCase().includes(filter) || note.content.toLowerCase().includes(filter)) {
                const card = document.createElement("div");
                card.className = `note-card ${note.pinned ? 'pinned' : ''}`;
                card.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <div class="note-actions">
                        <button class="action-btn" onclick="togglePin(${index})">${note.pinned ? '📌' : '📍'}</button>
                        <button class="action-btn" onclick="deleteNote(${index})">🗑️</button>
                    </div>
                `;

                if (note.pinned) {
                    pinnedContainer.appendChild(card);
                    hasPinned = true;
                } else {
                    allNotesContainer.appendChild(card);
                }
            }
        });

        const pinSection = document.getElementById("pin-section");
        if(pinSection) {
            pinSection.style.display = hasPinned ? "block" : "none";
        }
    }

    // नोट सेव करना
    if(saveBtn) {
        saveBtn.addEventListener("click", () => {
            const title = noteTitle.value.trim();
            const content = noteText.value.trim();
            if (!title || !content) return alert("कृपया टाइटल और नोट्स भरें!");

            notes.push({ title, content, pinned: false });
            localStorage.setItem("g_pwa_notes", JSON.stringify(notes));
            noteTitle.value = "";
            noteText.value = "";
            renderNotes();
        });
    }

    // डिलीट और पिन फंक्शंस ग्लोबल बनाना
    window.deleteNote = (index) => {
        if(confirm("क्या आप इसे डिलीट करना चाहते हैं?")) {
            notes.splice(index, 1);
            localStorage.setItem("g_pwa_notes", JSON.stringify(notes));
            renderNotes();
        }
    };

    window.togglePin = (index) => {
        notes[index].pinned = !notes[index].pinned;
        localStorage.setItem("g_pwa_notes", JSON.stringify(notes));
        renderNotes();
    };

    if(clearBtn) {
        clearBtn.addEventListener("click", () => {
            noteTitle.value = "";
            noteText.value = "";
        });
    }

    if(searchInput) searchInput.addEventListener("input", renderNotes);

    // थीम टॉगल
    if(themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
            themeToggle.textContent = isDark ? "🌙" : "☀️";
        });
    }

    // बैकअप डाउनलोड
    if(downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const blob = new Blob([JSON.stringify(notes)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my_private_notes.json";
            a.click();
        });
    }

    // रीस्टोर बैकअप
    if(restoreBtn) {
        restoreBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    notes = JSON.parse(event.target.result);
                    localStorage.setItem("g_pwa_notes", JSON.stringify(notes));
                    renderNotes();
                };
let notes = JSON.parse(localStorage.getItem("myNotes")) || [];
let editId = null;

function saveNote() {
  let title = document.getElementById("title").value.trim();
  let content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert("Please enter title and content!");
    return;
  }

  if (editId !== null) {
    let note = notes.find(n => n.id === editId);
    note.title = title;
    note.content = content;
    editId = null;
  } else {
    notes.unshift({
      id: Date.now(),
      title,
      content,
      pinned: false
    });
  }

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";

  saveData();
  renderNotes();
}

function saveData() {
  localStorage.setItem("myNotes", JSON.stringify(notes));
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderNotes(list = notes) {
  let area = document.getElementById("notes");
  area.innerHTML = "";

  [...list]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .forEach(note => {
      area.innerHTML += `
        <div class="note">
          <h3>${escapeHTML(note.title)} ${note.pinned ? "📌" : ""}</h3>
          <p>${escapeHTML(note.content)}</p>
          <button onclick="editNote(${note.id})">Edit</button>
          <button class="pin" onclick="pinNote(${note.id})">Pin</button>
          <button class="delete" onclick="deleteNote(${note.id})">Delete</button>
        </div>
      `;
    });
}

function editNote(id) {
  let note = notes.find(n => n.id === id);
  document.getElementById("title").value = note.title;
  document.getElementById("content").value = note.content;
  editId = id;
  window.scrollTo(0, 0);
}

function deleteNote(id) {
  if (confirm("Delete this note?")) {
    notes = notes.filter(n => n.id !== id);
    saveData();
    renderNotes();
  }
}

function pinNote(id) {
  let note = notes.find(n => n.id === id);
  note.pinned = !note.pinned;
  saveData();
  renderNotes();
}

function showAll() {
  renderNotes();
}

function showPinned() {
  renderNotes(notes.filter(n => n.pinned));
}

document.getElementById("search").addEventListener("input", function() {
  let q = this.value.toLowerCase();
  renderNotes(notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  ));
});

renderNotes();
                
                reader.readAsText(file);
            };
            input.click();
        });
    }

    renderNotes();
});
                          
