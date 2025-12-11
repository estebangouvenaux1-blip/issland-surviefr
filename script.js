// ===== AUTHENTIFICATION =====
let currentUser = null;

function initAuth() {
    const savedUser = localStorage.getItem('island-user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showApp();
        } catch (e) {
            showAuthModal();
        }
    } else {
        showAuthModal();
    }

    document.getElementById('switch-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('register-tab').classList.add('active');
    });

    document.getElementById('switch-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-tab').classList.remove('active');
        document.getElementById('login-tab').classList.add('active');
    });

    document.getElementById('login-btn').addEventListener('click', loginUser);
    document.getElementById('register-btn').addEventListener('click', registerUser);
    document.getElementById('nav-logout').addEventListener('click', logoutUser);
}

function getUsers() {
    return JSON.parse(localStorage.getItem('island-users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('island-users', JSON.stringify(users));
}

function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
        errorEl.textContent = '❌ Remplissez tous les champs';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        errorEl.textContent = '❌ Identifiants incorrects';
        return;
    }

    currentUser = { username: user.username, id: user.id };
    localStorage.setItem('island-user', JSON.stringify(currentUser));
    showApp();
}

function registerUser() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirm = document.getElementById('register-confirm').value.trim();
    const errorEl = document.getElementById('register-error');

    if (!username || !password || !confirm) {
        errorEl.textContent = '❌ Remplissez tous les champs';
        return;
    }

    if (password !== confirm) {
        errorEl.textContent = '❌ Les mots de passe ne correspondent pas';
        return;
    }

    if (password.length < 4) {
        errorEl.textContent = '❌ Le mot de passe doit avoir au moins 4 caractères';
        return;
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        errorEl.textContent = '❌ Cet utilisateur existe déjà';
        return;
    }

    const newUser = {
        id: 'user-' + Date.now(),
        username: username,
        password: password
    };

    users.push(newUser);
    saveUsers(users);

    currentUser = { username: newUser.username, id: newUser.id };
    localStorage.setItem('island-user', JSON.stringify(currentUser));
    showApp();
}

function logoutUser() {
    localStorage.removeItem('island-user');
    currentUser = null;
    location.reload();
}

function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    initApp();
}

// ===== APP NAVIGATION =====
function initApp() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            showPage(tabName);
        });
    });

    // Default page
    showPage('accueil');
    
    // Initialize features
    initRobloxData();
    initShorts();
    initChat();
    initCalls();
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageName).classList.add('active');
}

// ===== ROBLOX DATA =====
function initRobloxData() {
    fetchRobloxData();
    renderEvents();
    renderGallery();
}

async function fetchRobloxData() {
    try {
        const response = await fetch('https://games.roblox.com/v1/games?universeIds=5444661');
        const data = await response.json();
        
        if (data.data && data.data[0]) {
            const game = data.data[0];
            document.getElementById('joueurs-connectes').textContent = game.playing || '0';
            document.getElementById('note-jeu').textContent = game.averageRating ? game.averageRating.toFixed(1) + '⭐' : 'N/A';
            document.getElementById('visites-totales').textContent = (game.visits / 1000).toFixed(0) + 'K';
            document.getElementById('favoris').textContent = (game.favorited / 1000).toFixed(0) + 'K';
        }
    } catch (err) {
        console.error('Erreur API:', err);
    }
}

const DEFAULT_EVENTS = [
    { name: '🏆 Tournament', description: 'Tournoi de survie', date: 'Dec 20, 2025', icon: '🎮', status: 'EN DIRECT' },
    { name: '🎉 Festival', description: 'Grand festival d\'été', date: 'Jan 01, 2026', icon: '🎊', status: 'À VENIR' },
    { name: '�� Tropical Event', description: 'Événement tropical', date: 'Dec 25, 2025', icon: '🌺', status: 'EN COURS' }
];

function renderEvents() {
    const events = DEFAULT_EVENTS;
    const container = document.getElementById('events-container');
    container.innerHTML = events.map(e => `
        <div class="event-card">
            <div class="event-header">
                <h3>${e.icon} ${e.name}</h3>
                <span class="event-badge">${e.status}</span>
            </div>
            <p>${e.description}</p>
            <small>📅 ${e.date}</small>
        </div>
    `).join('');
}

function renderGallery() {
    const gallery = ['🏝️ Île Principale', '🏝️ Plage Secrète', '🗻 Montagne', '🌴 Jungle', '🏚️ Village', '⛰️ Grottes'];
    const container = document.getElementById('gallery-container');
    container.innerHTML = gallery.map(item => `<div class="gallery-item">${item}</div>`).join('');
}

// ===== SHORTS (TikTok-style) =====
let bc = null;

function initShorts() {
    try {
        if ('BroadcastChannel' in window) {
            bc = new BroadcastChannel('island-shorts');
            bc.onmessage = (e) => {
                if (e.data?.type === 'shorts-update') renderShorts();
            };
        }
    } catch (err) {
        console.warn('BroadcastChannel unavailable', err);
    }

    document.getElementById('publish-short-btn').addEventListener('click', () => {
        document.getElementById('short-publish-modal').classList.remove('hidden');
    });

    document.getElementById('cancel-short').addEventListener('click', () => {
        document.getElementById('short-publish-modal').classList.add('hidden');
    });

    document.getElementById('confirm-short').addEventListener('click', publishShort);

    renderShorts();
}

function getShorts() {
    return JSON.parse(localStorage.getItem('island-shorts')) || [];
}

function saveShorts(shorts) {
    localStorage.setItem('island-shorts', JSON.stringify(shorts));
    if (bc) bc.postMessage({ type: 'shorts-update' });
}

async function publishShort() {
    const file = document.getElementById('short-file').files[0];
    const caption = document.getElementById('short-caption').value.trim();

    if (!file && !caption) return;

    let mediaData = null;
    if (file) {
        mediaData = await readFileAsDataURL(file);
    }

    const short = {
        id: Date.now(),
        username: currentUser.username,
        userId: currentUser.id,
        caption: caption,
        media: mediaData,
        likes: [],
        comments: [],
        ts: Date.now()
    };

    const shorts = getShorts();
    shorts.unshift(short);
    if (shorts.length > 200) shorts.splice(200);
    saveShorts(shorts);

    document.getElementById('short-file').value = '';
    document.getElementById('short-caption').value = '';
    document.getElementById('short-publish-modal').classList.add('hidden');
    renderShorts();
}

function renderShorts() {
    const container = document.getElementById('shorts-feed');
    const shorts = getShorts();

    container.innerHTML = shorts.map(s => {
        const likes = Array.isArray(s.likes) ? s.likes.length : 0;
        const comments = Array.isArray(s.comments) ? s.comments : [];
        const liked = s.likes && s.likes.includes(currentUser.id);
        const media = s.media ? `<img class="short-media" src="${s.media}" alt="short">` : '';

        return `
            <div class="short-item" data-id="${s.id}">
                <div class="short-content">
                    ${media}
                    <div class="short-overlay">
                        <div class="short-user">👤 ${s.username}</div>
                        <div class="short-caption">${s.caption}</div>
                        <div class="short-actions">
                            <button class="short-like" data-id="${s.id}" style="color:${liked ? '#ff6b35' : 'white'}">👍 ${likes}</button>
                            <button class="short-comment" data-id="${s.id}">💬 ${comments.length}</button>
                        </div>
                        <div class="short-comments" style="display:none" data-id="${s.id}">
                            ${comments.map(c => `<div><strong>${c.user}</strong>: ${c.text}</div>`).join('')}
                            <input type="text" class="short-comment-input" placeholder="Commenter...">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Event listeners
    container.querySelectorAll('.short-like').forEach(btn => {
        btn.addEventListener('click', () => toggleShortLike(btn.getAttribute('data-id')));
    });

    container.querySelectorAll('.short-comment').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const commentsDiv = container.querySelector(`.short-comments[data-id="${id}"]`);
            if (commentsDiv) {
                commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
}

function toggleShortLike(shortId) {
    const shorts = getShorts();
    const short = shorts.find(s => String(s.id) === String(shortId));
    if (!short) return;

    short.likes = short.likes || [];
    const idx = short.likes.indexOf(currentUser.id);
    if (idx === -1) short.likes.push(currentUser.id);
    else short.likes.splice(idx, 1);

    saveShorts(shorts);
    renderShorts();
}

function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });
}

// ===== CHAT =====
function initChat() {
    try {
        if ('BroadcastChannel' in window && !bc) {
            bc = new BroadcastChannel('island-chat');
            bc.onmessage = (e) => {
                if (e.data?.type === 'chat-update') renderChat();
            };
        }
    } catch (err) {
        console.warn('BroadcastChannel unavailable for chat', err);
    }

    document.getElementById('chat-send').addEventListener('click', () => {
        sendChatMessage(document.getElementById('chat-input').value);
    });

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage(document.getElementById('chat-input').value);
    });

    document.getElementById('chat-image-btn').addEventListener('click', () => {
        document.getElementById('chat-image').click();
    });

    document.getElementById('chat-image').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const data = await readFileAsDataURL(file);
            sendChatMessage('', data);
        }
        e.target.value = '';
    });

    renderChat();
}

function getChat() {
    return JSON.parse(localStorage.getItem('island-chat')) || [];
}

function saveChat(list) {
    localStorage.setItem('island-chat', JSON.stringify(list));
    if (bc) bc.postMessage({ type: 'chat-update' });
}

function sendChatMessage(text, imageData = null) {
    if (!text && !imageData) return;

    const chat = getChat();
    const msg = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        username: currentUser.username,
        text: text || '',
        image: imageData || null,
        ts: Date.now()
    };

    chat.push(msg);
    if (chat.length > 500) chat.splice(0, chat.length - 500);
    saveChat(chat);
    renderChat();

    document.getElementById('chat-input').value = '';
}

function renderChat() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const chat = getChat();
    container.innerHTML = chat.map(m => {
        const time = new Date(m.ts).toLocaleTimeString();
        const txt = m.text ? `<div>${escapeHtml(m.text)}</div>` : '';
        const img = m.image ? `<img src="${m.image}" alt="image" style="max-width:200px; border-radius:8px; margin-top:0.5rem;">` : '';
        return `
            <div class="chat-msg">
                <strong>${escapeHtml(m.username)}</strong> <small>${time}</small>
                ${txt}${img}
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ===== APPELS =====
function initCalls() {
    document.getElementById('start-call-btn').addEventListener('click', () => {
        document.getElementById('call-modal').classList.remove('hidden');
    });

    document.getElementById('end-call').addEventListener('click', () => {
        document.getElementById('call-modal').classList.add('hidden');
    });

    document.getElementById('toggle-mic').addEventListener('click', toggleMic);
    document.getElementById('toggle-camera').addEventListener('click', toggleCamera);
}

function toggleMic() {
    const btn = document.getElementById('toggle-mic');
    btn.style.opacity = btn.style.opacity === '0.5' ? '1' : '0.5';
}

function toggleCamera() {
    const btn = document.getElementById('toggle-camera');
    btn.style.opacity = btn.style.opacity === '0.5' ? '1' : '0.5';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', initAuth);
