const API = "http://localhost:3019"; 

// 1. Add Feedback
async function addFeedback() {
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");
    
    // .trim() removes accidental spaces and prevents "spacebar only" submissions
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    // Granular validation checks
    if (!name && !message) {
        alert("Please fill in both your name and your feedback!");
        return; // Stops the function from executing further
    }
    
    if (!name) {
        alert("Name cannot be empty!");
        return;
    }
    
    if (!message) {
        alert("Feedback cannot be empty!");
        return;
    }

    await fetch(`${API}/addFeedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            message
        })
    });

    // Clear the inputs after submitting
    nameInput.value = "";
    messageInput.value = "";

    // Refresh the list
    loadFeedbacks();
}

// 2. View Feedbacks (Upgraded with Counter and Timestamp)
async function loadFeedbacks() {
    const response = await fetch(`${API}/feedbacks`);
    const feedbacks = await response.json();

    //  Update the Feedback Counter
    const counterBadge = document.getElementById("counter-badge");
    if (counterBadge) {
        counterBadge.textContent = `(${feedbacks.length})`;
    }

    const feedbackList = document.getElementById("feedbackList");
    feedbackList.innerHTML = "";

    feedbacks.forEach((feedback) => {
       // Format the timestamp (Includes a fallback just in case old data lacks a timestamp)
        const dateStr = feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : "Just now";

        // We use feedback._id here because MongoDB automatically generates an '_id' field for every document
        feedbackList.innerHTML += `
        <div class="feedback-card">
            <h3>${feedback.name}</h3>
            <p>${feedback.message}</p>
            <p class="timestamp-text" style="font-size: 0.8em; color: gray; margin-top: 5px;">${dateStr}</p>
            <button class="delete-btn" onclick="deleteFeedback('${feedback._id}')">Delete</button>
        </div>
        `;
    });
}

// 3. Delete Feedback
async function deleteFeedback(id) {
    await fetch(`${API}/feedback/${id}`, {
        method: "DELETE"
    });

    // Refresh the list to remove the deleted item
    loadFeedbacks();
}


const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const allCards = document.querySelectorAll('.feedback-card');

        allCards.forEach(card => {
            // Grabs all text inside the card (name, message, and timestamp)
            const textContent = card.innerText.toLowerCase();
            if (textContent.includes(searchTerm)) {
                card.style.display = "block"; // Show match
            } else {
                card.style.display = "none";  // Hide mismatch
            }
        });
    });
}

// Toggle Dark Mode Logic
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

// Load feedbacks immediately when the page opens
loadFeedbacks();