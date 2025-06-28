const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const buttonIcon = document.getElementById('button-icon');
const menuToggle = document.querySelector(".menu-toggle");
const clearHistoryBtn = document.getElementById("clear-history");

//function for opening the menu
menuToggle.addEventListener('click', () => {
    const icon = menuToggle.querySelector("i");
    const menu = document.querySelector(".menu");

    icon.classList.toggle("ri-menu-line");
    icon.classList.toggle("ri-menu-fold-line");
    menu.classList.toggle("open");
});

sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Clear the history function
clearHistoryBtn.addEventListener('click', () => {
    chrome.storage.local.set({ conversation: [] }, function () {
        chatLog.innerHTML = '';
    });
});

function sendMessage() {
    const message = userInput.value.trim();
    // if message is empty do nothing
    if (message === '') {
        return;
    }
    // if message = developer - show our message
    else if (message === 'developer') {
        // clear input value
        userInput.value = '';
        // append message as user - we will code it's function
        appendMessage('user', message);
        // sets a fake timeout that showing loading on send button
        setTimeout(() => {
            // send our message as bot(sender : bot)
            appendMessage('bot', 'This Source Coded By Reza Mehdikhanlou \nYoutube : @AsmrProg');
            // change button icon to default
            buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
            buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        }, 2000);
        return;
    }
    appendMessage('user', message);
    userInput.value = '';
    const url = 'https://chatgpt-42.p.rapidapi.com/conversationgpt4';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': 'PRIVATE KEY',
            'X-RapidAPI-Host': 'chatgpt-42.p.rapidapi.com'
        },
        body: `{"messages":[{"role":"user","content":"${message}"}]}`
    };

    fetch('https://chatgpt-42.p.rapidapi.com/conversationgpt4', options)
        .then((response) => response.json())
        .then((response) => {
            appendMessage('bot', response.result);
            buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
            buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        })
        .catch((err) => {
            appendMessage('bot', 'Error: ' + err.message);
            buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
            buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        });
}

function appendMessage(sender, message, saveToStorage = true) {
    const messageElement = document.createElement('div');
    const iconElement = document.createElement('div');
    const chatElement = document.createElement('div');
    const icon = document.createElement('i');

    chatElement.classList.add("chat-box");
    iconElement.classList.add("icon");
    messageElement.classList.add(sender);

    messageElement.innerText = message;

    if (sender === 'user') {
        icon.classList.add('fa-regular', 'fa-circle-user');
        iconElement.setAttribute('id', 'user-icon');
    } else {
        icon.classList.add('fa-solid', 'fa-robot');
        iconElement.setAttribute('id', 'bot-icon');
    }

    iconElement.appendChild(icon);
    chatElement.appendChild(iconElement);
    chatElement.appendChild(messageElement);
    chatLog.appendChild(chatElement);
    chatLog.scrollTop = chatLog.scrollHeight;  // correct scroll


    // Save message to chrome.storage.local
    if (saveToStorage) {
        // key and callback
        chrome.storage.local.get({ conversation: [] }, function (result) {
            //saving the result.key to a constant
            const conversation = result.conversation;
            //adding a new message to the array including the sender and the message
            conversation.push({ sender, message });
            // then saving into the storage
            chrome.storage.local.set({ conversation });
        });
    }
}

// When loading history, set saveToStorage to false
// it retrives the message from the storage
chrome.storage.local.get({ conversation: [] }, function (result) {
    // the conversation is saved in the storage so for each the function appendMessage is called
    // so that is shows the full conversation
    result.conversation.forEach(msg => {
        appendMessage(msg.sender, msg.message, false);
    });
});
