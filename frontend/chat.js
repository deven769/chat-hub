let socket;
let token = localStorage.getItem('token') || '';  // Retrieve token from localStorage
let username = localStorage.getItem('username') || '';  // Retrieve username from localStorage


document.addEventListener('DOMContentLoaded', function () {
    if (token) {
        // If token exists, directly initialize the WebSocket and load messages
        initWebSocket();
        loadMessages();
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('user-info').textContent = `Logged in as: ${username}`;
    } else {
        // No token found, redirect to login
        redirectToLogin();
    }

    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });

    document.getElementById('message-form').addEventListener('submit', function (e) {
        e.preventDefault();
        sendMessage();
    });

    const searchInput = document.getElementById('search-query');
    let debounceTimeout;

    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimeout); // Clear previous timeout
        debounceTimeout = setTimeout(() => searchMessages(), 300);  // Debounce to delay the search request
    });
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log("Attempting login with username:", username);

    fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Login response:", data);
        if (data.access) {
            token = data.access;
            _username = username;
            localStorage.setItem('token', token);  // Store token in localStorage
            localStorage.setItem('username', _username);  // Store token in localStorage
            console.log("JWT Token received:", token);
            initWebSocket();
            loadMessages();
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('chat-container').style.display = 'block';
            document.getElementById('user-info').textContent = `Logged in as: ${username}`;

        } else {
            alert('Invalid credentials');
        }
    })
    .catch(error => {
        console.error("Error during login:", error);
        alert('Login failed. Please try again.');
    });
}

function initWebSocket() {
    // If WebSocket already exists and is open, do not reinitialize
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("WebSocket is already open. Skipping reinitialization.");
        return;
    }

    console.log("Initializing WebSocket connection...");
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);

    socket.onopen = function() {
        console.log("WebSocket connection established.");
    };

    socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            console.log("Message received:", data);
            addMessageToChat(data.user, data.message, data.timestamp);
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    };

    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
        if (!event.wasClean) {
            console.error('Connection lost. Reconnecting...');
            reconnectWebSocket();
        }
    };
}


function reconnectWebSocket() {
    // Attempt to reconnect after a delay
    setTimeout(() => {
        console.log("Reconnecting WebSocket...");
        initWebSocket();
    }, 3000); // Delay of 3 seconds before reconnecting
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (message !== '') {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message }));
            messageInput.value = '';
        } else {
            console.error("WebSocket connection is not open.");
            alert('Unable to send message. Please check your connection and try again.');
        }
    }
}

function addMessageToChat(user, message, timestamp) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');

    // Format the timestamp to a shorter format
    const formattedTime = formatTime(timestamp);

    // Create a span for the username with the green color
    const usernameElement = document.createElement('span');
    usernameElement.className = 'username';  // Apply green color class
    usernameElement.textContent = user;       // Set the username text

    // Check if the message is from the logged-in user
    if (user === username) {
        messageElement.className = 'message-right';  // Apply right-side style for logged-in user
    } else {
        messageElement.className = 'message-left';   // Apply left-side style for other users
    }

    // Set the message content with the formatted time and username
    messageElement.innerHTML = `[${formattedTime}] `; // Set the timestamp first
    messageElement.appendChild(usernameElement); // Append the username element
    messageElement.innerHTML += `: ${message}`; // Add the message text

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.abs(now - date);

    // Check if the message is from today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))} minutes ago`;
    } else {
        return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' }) + ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}





function loadMessages() {
    fetch('http://localhost:8000/api/messages/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (response.status === 401) {
            redirectToLogin();  // Handle token expiration
            return; 
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        data.forEach(message => {
            addMessageToChat(message.user, message.content, message.timestamp);
        });
    })
    .catch(error => {
        console.error("Error loading messages:", error);
        // alert('Failed to load messages. Please try refreshing the page.');
    });
}

function searchMessages() {
    const query = document.getElementById('search-query').value.trim();

    if (query === '') {
        loadMessages();
        return;
    }

    fetch(`http://localhost:8000/api/messages/search/?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (response.status === 401) {
            redirectToLogin(); // Handle token expiration
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = ''; 

        if (data.length === 0) {
            messagesDiv.textContent = 'No messages found matching your search.';
        } else {
            data.forEach(message => {
                addMessageToChat(message.user, message.content, message.timestamp);
            });
        }
    })
    .catch(error => {
        console.error("Error during message search:", error);
        alert('Search failed. Please try again.');
    });
}

document.getElementById('logout-btn').addEventListener('click', function () {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    if (socket) {
        socket.close();
    }
    
    // Redirect to login
    redirectToLogin();
});

function redirectToLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('chat-container').style.display = 'none';
    alert('Session expired. Please log in again.');
}
