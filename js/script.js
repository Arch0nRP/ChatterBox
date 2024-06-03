// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');

// Secure Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password === 'correct_password') { // Replace with a secure method
        auth.signInAnonymously().then(() => {
            localStorage.setItem('username', username);
            showChat();
        }).catch(error => {
            console.error(error);
        });
    } else {
        alert('Incorrect username or password');
    }
}

function showChat() {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';

    db.collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageElement = document.createElement('div');
            messageElement.textContent = `${message.username}: ${message.text}`;
            chatBox.appendChild(messageElement);
        });
    });
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;

    if (message.trim()) {
        db.collection('messages').add({
            username: localStorage.getItem('username'),
            text: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = '';
    }
}

function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('username');
        chatContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }).catch(error => {
        console.error(error);
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
