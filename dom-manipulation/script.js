
// Save quotes array to localStorage
function saveQuotesToLocalStorage() {
  localStorage.setItem("quotesData", JSON.stringify(quotes));
}

// Load quotes array from localStorage
function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem("quotesData");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Invalid JSON in localStorage", e);
    }
  }
}



// Load from localStorage first

let quotes = [];
loadQuotesFromLocalStorage();

if (quotes.length === 0) {
  // Default quotes on first run
  quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "Fire si fire..wewe Goliathi!!! wewe Goliathi!!.", category: "Comedy" },
    { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
  ];
  saveQuotesToLocalStorage();
}



// DOM Element references

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");


// Create Add Quote Form

function createAddQuoteForm() {
  let textInput = document.getElementById("newQuoteText");
  let categoryInput = document.getElementById("newQuoteCategory");
  let addBtn = document.getElementById("addQuoteBtn");

  if (!textInput || !categoryInput || !addBtn) {
    const container = document.createElement("div");
    container.id = "addQuoteContainer";
    container.innerHTML = `
      <h3>Add a New Quote</h3>
      <div style="margin:8px 0;">
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button id="addQuoteBtn" type="button">Add Quote</button>
      </div>
    `;
    quoteDisplay.parentNode.appendChild(container);

    textInput = document.getElementById("newQuoteText");
    categoryInput = document.getElementById("newQuoteCategory");
    addBtn = document.getElementById("addQuoteBtn");
  }

  addBtn.removeEventListener("click", addQuote);
  addBtn.addEventListener("click", addQuote);
}

// Populate Categories Dropdown

function loadCategories() {
  let select = document.getElementById("categorySelect");

  const categories = [...new Set(quotes.map(q => q.category))];

  const previous = select.value;
  select.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  if (previous && categories.includes(previous)) {
    select.value = previous;
  }
}


// Show Random Quote Based on Selected Category

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  quoteDisplay.textContent = `"${filtered[randomIndex].text}"`;
}


// Add New Quote with localStorage Update

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  // Add new quote object
  quotes.push({ text, category });

  // Save to localStorage
  saveQuotesToLocalStorage();

  // Clear fields
  textInput.value = "";
  categoryInput.value = "";

  // Refresh categories + display
  loadCategories();
  categorySelect.value = category;
  showRandomQuote();
}

// Initialize Application

function init() {
  createAddQuoteForm();
  loadQuotesFromLocalStorage();
  loadCategories();

  newQuoteBtn.addEventListener("click", showRandomQuote);

  const exportBtn = document.getElementById("exportJsonBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportQuotesToJson);

  showRandomQuote();
}

document.addEventListener("DOMContentLoaded", init);


// Export Quotes to JSON File

function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);  // formatted JSON
  const blob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_export.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

