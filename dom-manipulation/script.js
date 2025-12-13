// INITIAL QUOTES & LOCAL STORAGE

let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

function saveQuotesToLocalStorage() {
  localStorage.setItem("quotesData", JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem("quotesData");
  if (stored) {
    try { quotes = JSON.parse(stored); } 
    catch (e) { console.error("Invalid JSON in localStorage", e); }
  }
}

loadQuotesFromLocalStorage();
if (quotes.length === 0) {
  quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "Fire si fire..wewe Goliathi!!! wewe Goliathi!!.", category: "Comedy" },
    { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
  ];
  saveQuotesToLocalStorage();
}

// CREATE ADD QUOTE FORM

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) { alert("Please fill both fields."); return; }

  quotes.push({ text, category });
  saveQuotesToLocalStorage();

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  categorySelect.value = category;
  localStorage.setItem("selectedCategory", category);
  showRandomQuote();
}


// POPULATE CATEGORIES
function populateCategories() {
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categorySelect.value = savedCategory;
}


// FILTER QUOTES
function filterQuotes() {
  const selectedCategory = categorySelect.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  return selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
}

// SHOW RANDOM QUOTE

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  quoteDisplay.textContent = `"${filtered[randomIndex].text}"`;
}

// IMPORT / EXPORT JSON
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotesToLocalStorage();
      populateCategories();
      showRandomQuote();
      showNotification("Quotes imported successfully!");
    } catch (err) {
      alert("Error importing quotes.");
      console.error(err);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}


// SERVER SYNC SIMULATION

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchServerQuotes() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error("Failed to fetch server data");
    const data = await res.json();
    return data.map(item => ({ text: item.title, category: item.body || "General" }));
  } catch (err) {
    console.error("Error fetching server quotes:", err);
    return [];
  }
}

async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  let updated = false;

  serverQuotes.forEach(sq => {
    const exists = quotes.find(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) { quotes.push(sq); updated = true; }
  });

  if (updated) {
    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
    showNotification("Quotes updated from server!");
  }
}

setInterval(syncWithServer, 60000); // periodic update every 60s

function showNotification(message) {
  const notification = document.getElementById("serverNotification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 5000);
}

// MANUAL SYNC BUTTON
function createConflictResolutionUI() {
  const manualBtn = document.getElementById("manualSyncBtn");
  manualBtn.addEventListener("click", async () => {
    await syncWithServer();
    showNotification("Manual sync completed!");
  });
}

// INITIALIZE APP

function init() {
  populateCategories();
  showRandomQuote();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  categorySelect.addEventListener("change", filterQuotes);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportJsonBtn").addEventListener("click", exportQuotesToJson);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  createConflictResolutionUI();
  syncWithServer(); // initial server fetch
}

document.addEventListener("DOMContentLoaded", init);
