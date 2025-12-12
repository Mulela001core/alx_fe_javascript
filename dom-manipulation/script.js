// QUOTE DATA
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { text: "Fire si fire..wewe Goliathi!!! wewe Goliathi!!.", category: "Comedy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];


// DOM ELEMENT REFERENCES

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categorySelect = document.getElementById("categorySelect");

const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");


// POPULATE CATEGORY DROPDOWN (Step 1)

function loadCategories() {
  // Get unique categories
  let categories = [...new Set(quotes.map(q => q.category))];

  categorySelect.innerHTML = "";

  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// SHOW RANDOM QUOTE (Step 2)

function showRandomQuote() {
  let selectedCategory = categorySelect.value;

  let filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}"`;
}

// ADD NEW QUOTE (Step 3)

function addQuote() {
  let text = newQuoteText.value.trim();
  let category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please fill both fields!");
    return;
  }

  // Add new quote
  quotes.push({
    text: text,
    category: category
  });

  // Clear inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Refresh category dropdown
  loadCategories();

  alert("Quote added successfully!");
}

// EVENT LISTENERS
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);


// INITIALIZATION
loadCategories(); // load categories on page load
showRandomQuote(); // show first quote immediately
