// ---------------------
// MOCK SERVER API URL
// ---------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ---------------------
// Fetch quotes from server
// ---------------------
async function fetchServerQuotes() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error("Failed to fetch server data");
    const data = await res.json();

    // Transform server data into our quote format
    const serverQuotes = data.map(item => ({
      text: item.title,
      category: item.body || "General",
    }));

    return serverQuotes;
  } catch (err) {
    console.error("Error fetching server quotes:", err);
    return [];
  }
}

// ---------------------
// Merge Server Data with Local Quotes
// ---------------------
async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();

  let updated = false;

  // Server takes precedence for conflicts
  serverQuotes.forEach(sq => {
    const exists = quotes.find(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
    showNotification("Quotes updated from server!");
  }
}

// ---------------------
// Periodic Sync (e.g., every 60s)
// ---------------------
setInterval(syncWithServer, 60000); // 60 seconds

// ---------------------
// Show notification to user
// ---------------------
function showNotification(message) {
  let notification = document.getElementById("serverNotification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "serverNotification";
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.padding = "10px 20px";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "#fff";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 5000);
}

// ---------------------
// Manual Conflict Resolution UI
// ---------------------
function createConflictResolutionUI() {
  let container = document.getElementById("conflictContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "conflictContainer";
    container.style.margin = "10px 0";
    container.innerHTML = `
      <button id="manualSyncBtn">Sync with Server Now</button>
    `;
    document.body.appendChild(container);

    const manualBtn = document.getElementById("manualSyncBtn");
    manualBtn.addEventListener("click", async () => {
      await syncWithServer();
      showNotification("Manual sync completed!");
    });
  }
}

// ---------------------
// Initialize server sync
// ---------------------
document.addEventListener("DOMContentLoaded", () => {
  createConflictResolutionUI();
  syncWithServer(); // initial sync
});

// GLOBAL QUOTES ARRAY

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Attitude" },
    { text: "The best way to predict the future is to create it.", category: "Future" },
    { text: "You miss 100% of the shots you don't take.", category: "Courage" },
    { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Individuality" }

];

// SAVE QUOTES TO LOCAL STORAGE

function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// DISPLAY RANDOM QUOTE

function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
        document.getElementById("quoteDisplay").innerText = "No quotes found.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
}


// ADD NEW QUOTE

function addQuote() {
    const textInput = document.getElementById("quoteText");
    const categoryInput = document.getElementById("quoteCategory");

    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newText === "" || newCategory === "") {
        alert("Please enter both the quote and category.");
        return;
    }

    // Add new quote
    quotes.push({ text: newText, category: newCategory });

    // Save to local storage
    saveQuotes();

    // Update categories live
    populateCategories();

    textInput.value = "";
    categoryInput.value = "";

    alert("Quote added!");
}


// POPULATE CATEGORY DROPDOWN

function populateCategories() {
    const categorySelect = document.getElementById("categoryFilter");

    // Clear dropdown
    categorySelect.innerHTML = `<option value="all">All Categories</option>`;

    // Extract unique categories
    const categories = [...new Set(quotes.map(q => q.category))];

    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Restore last selected category
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
        categorySelect.value = savedCategory;
    }
}


// FILTER QUOTES

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;

    // Save selection
    localStorage.setItem("selectedCategory", selectedCategory);

    // Refresh displayed quote using filter
    showRandomQuote();
}


// RETURN FILTERED QUOTES

function getFilteredQuotes() {
    const selectedCategory = localStorage.getItem("selectedCategory") || "all";

    if (selectedCategory === "all") return quotes;

    return quotes.filter(q => q.category === selectedCategory);
}


// EXPORT QUOTES TO JSON

function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
}

// IMPORT QUOTES FROM JSON FILE

function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
        const importedQuotes = JSON.parse(e.target.result);

        // Merge imported quotes
        quotes.push(...importedQuotes);

        // Save & update UI
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
    };

    fileReader.readAsText(event.target.files[0]);
}

// INITIALIZE PAGE

window.onload = function () {
    populateCategories();
    showRandomQuote();

    document.getElementById("categoryFilter")
        .addEventListener("change", filterQuotes);

    document.getElementById("showQuoteBtn")
        .addEventListener("click", showRandomQuote);

    document.getElementById("addQuoteBtn")
        .addEventListener("click", addQuote);

    document.getElementById("exportBtn")
        .addEventListener("click", exportToJsonFile);
};

