const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const notesList = document.querySelector("#notes-list");
const errorMessage = document.querySelector("#error-message");
const noteCount = document.querySelector("#note-count");
const characterCount = document.querySelector("#character-count");
const searchInput = document.querySelector("#search-input");

let notes = JSON.parse(localStorage.getItem("quicknotes")) || [];

function saveNotes() {
  localStorage.setItem("quicknotes", JSON.stringify(notes));
}

function updateNoteCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

function render() {
  notesList.textContent = "";

  const searchWords = searchInput.value.trim().toLowerCase();
  const matchingNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchWords)
  );

  if (searchWords !== "" && matchingNotes.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No notes match your search.";
    notesList.append(message);
  } else {
    matchingNotes.forEach((note) => {
      const noteCard = document.createElement("li");
      noteCard.classList.add(
        "note-card",
        `category-${note.category.toLowerCase()}`
      );

      const noteText = document.createElement("p");
      noteText.textContent = note.text;

      const categoryLabel = document.createElement("small");
      categoryLabel.textContent = note.category;

      const dateLabel = document.createElement("small");
      dateLabel.textContent = note.createdAt;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        const noteIndex = notes.findIndex((item) => item.id === note.id);
        notes.splice(noteIndex, 1);
        saveNotes();
        render();
      });

      noteCard.append(noteText, categoryLabel, dateLabel, deleteButton);
      notesList.append(noteCard);
    });
  }

  updateNoteCount();
}

noteInput.addEventListener("input", () => {
  characterCount.textContent =
    `${noteInput.value.length} / 200 characters`;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteInput.value.trim();

  if (text.length === 0) {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";

  const note = {
    id: Date.now(),
    text,
    category: noteCategory.value,
    createdAt: new Date().toLocaleString(),
  };

  notes.push(note);
  saveNotes();
  render();

  noteInput.value = "";
  characterCount.textContent = "0 / 200 characters";
});

searchInput.addEventListener("input", render);

render();