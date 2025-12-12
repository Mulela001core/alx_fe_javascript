
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
