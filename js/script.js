// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const loginError = document.getElementById('login-error');

// Secure Login with Error Handling
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password === 'correct_password') { // Replace with a secure method
        auth.signInAnonymously().then(() => {
            localStorage.setItem('username', escapeHtml(username));
            showChat();
        }).catch(error => {
            loginError.textContent = 'Login failed. Please try again.';
            console.error('Login error:', error);
        });
    } else {
        loginError.textContent = 'Incorrect username or password';
    }
}

// Show Chat Room
function showChat() {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    db.collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageElement = document.createElement('div');
            messageElement.textContent = `${escapeHtml(message.username)}: ${escapeHtml(message.text)}`;
            chatBox.appendChild(messageElement);
        });
    });
}

// Send Message
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;

    if (message.trim()) {
        db.collection('messages').add({
            username: localStorage.getItem('username'),
            text: escapeHtml(message),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error('Error sending message:', error);
        });
        messageInput.value = '';
    }
}

// Logout
function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('username');
        chatContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

// Security: Protect against XSS by escaping HTML
function escapeHtml(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
}

// Error Reporting
window.addEventListener('error', function(event) {
    console.error('Error occurred:', event.message, 'at', event.filename, 'line', event.lineno);
});

// Disable right-click and F12
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
document.addEventListener('keydown', function(event) {
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I') || (event.ctrlKey && event.shiftKey && event.key === 'J')) {
        event.preventDefault();
    }
});
