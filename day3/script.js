let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];
function searchNotes(word) {

 const searchWord = word.toLowerCase();

  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchWord)
  );
}

console.log(searchNotes("milk")); // Expected: Buy milk and bread
console.log(searchNotes("JAVASCRIPT")); // Expected: Revise JavaScript arrays
console.log(searchNotes("pizza")); // Expected: []
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}
console.log(longestNote()); // Expected: note with id 3
const savedNotes = notes;
notes = [];

console.log(longestNote()); // Expected: null

notes = savedNotes;
function countByCategory() {
  const counts = {};

  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }
const savedNotesForCount = notes;
notes = [];

console.log(countByCategory()); // Expected: {}

notes = savedNotesForCount;
function getSummary() {
  const counts = countByCategory();
  const noteWord = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}
console.log(getSummary()); // Expected: 5 notes: 2 personal, 1 work, 2 study.

const savedNotesForSummary = notes;
notes = [savedNotesForSummary[0]];

console.log(getSummary()); // Expected: 1 note: 1 personal, 0 work, 0 study.

notes = savedNotesForSummary;
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();

  return notes.some((note) =>
    note.text.trim().toLowerCase() === cleanedText
  );
}
console.log(isDuplicate("CALL MUM")); // Expected: true
console.log(isDuplicate("Go to church")); // Expected: false
console.log(isDuplicate("   Call mum   ")); // Expected: true

function addNote(text, category) {
  const cleanedText = text.trim();

  if (cleanedText.length === 0 || cleanedText.length > 200) {
    console.log("❌ Note rejected: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(cleanedText)) {
    console.log("❌ Note rejected: duplicate note.");
    return false;
  }

  if (!["personal", "work", "study"].includes(category)) {
    console.log("❌ Note rejected: invalid category.");
    return false;
  }

  const newNote = {
    id: Date.now(),
    text: cleanedText,
    category: category,
  };

  notes.push(newNote);

  console.log(`✅ Note added: "${newNote.text}"`);
  return true;
}
console.log(addNote("Learn GitHub", "study")); // Expected: true
console.log(addNote("  CALL MUM  ", "personal")); // Expected: false
console.log(addNote("Buy a notebook", "shopping")); // Expected: false
console.log(addNote("   ", "personal")); // Expected: false
console.log(addNote("Pray before studying", "personal")); // Expected: true
