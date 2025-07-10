// src/assets/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.textContent = message;
        chatMessages.appendChild(userMsg);

        chatInput.value = '';

        setTimeout(() => {
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'message assistant';
            assistantMsg.textContent = 'This is a simulated response.';
            chatMessages.appendChild(assistantMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});