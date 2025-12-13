// ---------------------
// MOCK SERVER API URL
// ---------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ---------------------
// GLOBAL QUOTES ARRAY
// ---------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Attitude" },
    { text: "The best way to predict the future is to create it.", category: "Future" },
    { text: "You miss 100% of the shots you don't take.", category: "Courage" },
    { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Individuality" }
];

// ---------------------
// LOCAL STORAGE
// ---------------------
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------------
// FETCH QUOTES FROM SERVER
// ---------------------
async function fetchServerQuotes() {
    try {
        const res = await fetch(SERVER_URL);
        if (!res.ok) throw new Error("Failed to fetch server data");
        const data = await res.json();

        return data.map(item => ({
            text: item.title,
            category: item.body || "Server"
        }));
    } catch (err) {
        console.error(err);
        return [];
    }
}

// ---------------------
// SYNC WITH SERVER (SERVER WINS)
// ---------------------
async function syncWithServer() {
    const serverQuotes = await fetchServerQuotes();
    let updated = false;

    serverQuotes.forEach(sq => {
        const exists = quotes.some(lq => lq.text === sq.text);
        if (!exists) {
            quotes.push(sq);
            updated = true;
        }
    });

    if (updated) {
        saveQuotes();
        populateCategories();
        showRandomQuote();
        showNotification("Quotes updated from server!");
    }
}

// ---------------------
// PERIODIC SYNC
// ---------------------
setInterval(syncWithServer, 60000);

// ---------------------
// NOTIFICATION
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
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => notification.style.display = "none", 4000);
}

// ---------------------
// MANUAL SYNC UI
// ---------------------
function createConflictResolutionUI() {
    if (!document.getElementById("manualSyncBtn")) {
        const btn = document.createElement("button");
        btn.id = "manualSyncBtn";
        btn.textContent = "Sync with Server Now";
        btn.onclick = async () => {
            await syncWithServer();
            showNotification("Manual sync completed!");
        };
        document.body.appendChild(btn);
    }
}

// ---------------------
// CREATE ADD QUOTE FORM (REQUIRED)
// ---------------------
function createAddQuoteForm() {
    if (!document.getElementById("dynamicAddQuoteForm")) {
        const container = document.createElement("div");
        container.id = "dynamicAddQuoteForm";
        container.innerHTML = `
            <h3>Add a New Quote</h3>
            <input id="quoteText" type="text" placeholder="Enter quote text" />
            <input id="quoteCategory" type="text" placeholder="Enter quote category" />
            <button id="addQuoteBtn" type="button">Add Quote</button>
        `;
        document.body.appendChild(container);
    }

    document
        .getElementById("addQuoteBtn")
        .addEventListener("click", addQuote);
}

// ---------------------
// DISPLAY RANDOM QUOTE
// ---------------------
function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    const display = document.getElementById("quoteDisplay");

    if (filteredQuotes.length === 0) {
        display.innerText = "No quotes found.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    display.innerText = filteredQuotes[randomIndex].text;
}

// ---------------------
// ADD NEW QUOTE
// ---------------------
function addQuote() {
    const textInput = document.getElementById("quoteText");
    const categoryInput = document.getElementById("quoteCategory");

    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
        alert("Please enter both the quote and category.");
        return;
    }

    quotes.push({ text, category });
    saveQuotes();
    populateCategories();

    textInput.value = "";
    categoryInput.value = "";

    showRandomQuote();
}

// ---------------------
// POPULATE CATEGORIES
// ---------------------
function populateCategories() {
    const select = document.getElementById("categoryFilter");
    select.innerHTML = `<option value="all">All Categories</option>`;

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });

    const saved = localStorage.getItem("selectedCategory");
    if (saved) select.value = saved;
}

// ---------------------
// FILTER QUOTES
// ---------------------
function filterQuotes() {
    const selected = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selected);
    showRandomQuote();
}

// ---------------------
// GET FILTERED QUOTES
// ---------------------
function getFilteredQuotes() {
    const selected = localStorage.getItem("selectedCategory") || "all";
    return selected === "all"
        ? quotes
        : quotes.filter(q => q.category === selected);
}

// ---------------------
// EXPORT JSON
// ---------------------
function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
}

// ---------------------
// IMPORT JSON
// ---------------------
function importFromJsonFile(event) {
    const reader = new FileReader();
    reader.onload = e => {
        const importedQuotes = JSON.parse(e.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
    };
    reader.readAsText(event.target.files[0]);
}

// ---------------------
// INITIALIZE APP
// ---------------------
window.onload = function () {
    createAddQuoteForm();
    createConflictResolutionUI();
    populateCategories();
    showRandomQuote();

    document.getElementById("categoryFilter")
        .addEventListener("change", filterQuotes);

    document.getElementById("showQuoteBtn")
        .addEventListener("click", showRandomQuote);

    document.getElementById("exportBtn")
        .addEventListener("click", exportToJsonFile);

    syncWithServer();
};


