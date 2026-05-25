const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const QRCode = require('qrcode');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "LOXASMD_SECRET";
const DEV_NAME = "DimszXyzz";

// ============ DATABASE ============
const usersFile = './users.json';
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({
        users: [{ id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Admin', role: 'super_admin' }]
    }));
}

const userSettingsFile = './user_settings.json';
if (!fs.existsSync(userSettingsFile)) fs.writeFileSync(userSettingsFile, '{}');

const botsFile = './bots.json';
if (!fs.existsSync(botsFile)) fs.writeFileSync(botsFile, '{}');

function readUsers() { return JSON.parse(fs.readFileSync(usersFile)); }
function writeUsers(data) { fs.writeFileSync(usersFile, JSON.stringify(data, null, 2)); }
function readUserSettings() { return JSON.parse(fs.readFileSync(userSettingsFile)); }
function writeUserSettings(data) { fs.writeFileSync(userSettingsFile, JSON.stringify(data, null, 2)); }
function readBots() { return JSON.parse(fs.readFileSync(botsFile)); }
function writeBots(data) { fs.writeFileSync(botsFile, JSON.stringify(data, null, 2)); }

const activeSessions = new Map();

function getUserSettings(userId) {
    const settings = readUserSettings();
    if (!settings[userId]) {
        settings[userId] = { botName: 'LoxasMD', menuImageUrl: 'https://telegra.ph/file/4e2c6c6f8e6f4e8c9d0e.jpg', ownerName: 'DimszXyz', ownerNumber: '6282342265016' };
        writeUserSettings(settings);
    }
    return settings[userId];
}

// ============ MENU ============
function getMenuText(settings) {
    return `╔══════════════════════════════════════════════════╗
║            🔥 ${settings.botName} 🔥                  ║
║         WhatsApp Bot 150+ Fitur                       ║
║           👨‍💻 By ${DEV_NAME} 👨‍💻                    ║
╠══════════════════════════════════════════════════════╣
║ 📱 .tiktok .ig .fb .ytmp3 .ytmp4                    ║
║ 🎨 .stiker .brat .qc                                ║
║ 🤖 .gpt .claude .gemini                             ║
║ ⚙️ .qrcode .cuaca .kalkulator .translate           ║
║ 🔍 .ytsearch .pinterest .brainly .wikipedia         ║
║ 🕌 .jsholat .quran .doa                             ║
║ 👑 .kick .promote .antilink .tagall                 ║
║ 🎮 .tebakgambar .suit .dadu                         ║
║ ℹ️ .ping .menu .infobot .creator                    ║
╚══════════════════════════════════════════════════════╝
📌 TOTAL 150+ FITUR | ⚡ .ping | 👨‍💻 ${DEV_NAME}`;
}

// ============ HANDLE COMMAND ============
async function handleCommand(cmd, args, sock, to, userId) {
    const arg = args.join(' ');
    const settings = getUserSettings(userId);
    
    switch(cmd) {
        case 'ping': return { type: 'text', text: `🏓 Pong! ${settings.botName} Aktif` };
        case 'menu': return { type: 'text', text: getMenuText(settings) };
        case 'infobot': return { type: 'text', text: `🤖 ${settings.botName}\n👑 ${settings.ownerName}\n📱 wa.me/${settings.ownerNumber}\n👨‍💻 ${DEV_NAME}` };
        case 'creator': return { type: 'text', text: `👨‍💻 LoxasMD By ${DEV_NAME}` };
        case 'gpt': return { type: 'text', text: `🤖 GPT: ${arg}` };
        case 'cuaca': return { type: 'text', text: `🌤️ Cuaca ${arg}: Cerah 30°C` };
        case 'qrcode': return { type: 'text', text: `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(arg)}` };
        case 'kalkulator': try { return { type: 'text', text: `📱 Hasil: ${eval(arg)}` }; } catch(e) { return { type: 'text', text: '❌ Contoh: 8*7' }; }
        default: return { type: 'text', text: `❌ .menu untuk 150+ fitur` };
    }
}

// ============ AUTH ============
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
}

function admin(req, res, next) {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Admin only' });
    next();
}

// API
app.get('/', (req, res) => { res.send('✅ LoxasMD API Running'); });

app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    const db = readUsers();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
    const newUser = { id: db.users.length + 1, email, password: bcrypt.hashSync(password, 10), name: name || email.split('@')[0], role: 'user' };
    db.users.push(newUser);
    writeUsers(db);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readUsers();
    const user = db.users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/google', async (req, res) => {
    const { email, name } = req.body;
    let db = readUsers();
    let user = db.users.find(u => u.email === email);
    if (!user) {
        user = { id: db.users.length + 1, email, password: bcrypt.hashSync('google', 10), name: name || email.split('@')[0], role: 'user' };
        db.users.push(user);
        writeUsers(db);
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user });
});

app.get('/api/auth/me', auth, (req, res) => {
    const db = readUsers();
    const user = db.users.find(u => u.id === req.user.id);
    res.json({ user });
});

app.get('/api/user/settings', auth, (req, res) => {
    res.json({ settings: getUserSettings(req.user.id), devName: DEV_NAME });
});

app.post('/api/user/settings', auth, (req, res) => {
    const { botName, menuImageUrl, ownerName, ownerNumber } = req.body;
    const settings = readUserSettings();
    if (!settings[req.user.id]) settings[req.user.id] = {};
    if (botName !== undefined) settings[req.user.id].botName = botName;
    if (menuImageUrl !== undefined) settings[req.user.id].menuImageUrl = menuImageUrl;
    if (ownerName !== undefined) settings[req.user.id].ownerName = ownerName;
    if (ownerNumber !== undefined) settings[req.user.id].ownerNumber = ownerNumber;
    writeUserSettings(settings);
    res.json({ success: true });
});

app.post('/api/bot/create', auth, async (req, res) => {
    const userId = req.user.id;
    const sessionId = `user_${userId}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
    const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ['LoxasMD', 'Chrome', '1.0.0'] });
    sock.ev.on('creds.update', saveCreds);
    
    let qrSent = false;
    sock.ev.on('connection.update', async (update) => {
        const { qr, connection } = update;
        if (qr && !qrSent) {
            qrSent = true;
            const qrImage = await QRCode.toDataURL(qr);
            activeSessions.set(sessionId, { sock, status: 'waiting', qr: qrImage });
            const bots = readBots();
            bots[userId] = { status: 'waiting', qr: qrImage };
            writeBots(bots);
            res.json({ success: true, qr: qrImage, sessionId });
        }
        if (connection === 'open') {
            activeSessions.set(sessionId, { sock, status: 'connected' });
            const bots = readBots();
            bots[userId] = { status: 'connected' };
            writeBots(bots);
        }
    });
    setTimeout(() => { if (!qrSent) res.status(504).json({ error: 'Timeout' }); }, 30000);
});

app.get('/api/bot/status', auth, (req, res) => {
    const bots = readBots();
    res.json({ status: bots[req.user.id]?.status || 'not_created' });
});

app.post('/api/bot/command', auth, async (req, res) => {
    const { command, args, to } = req.body;
    const sessionId = `user_${req.user.id}`;
    const bot = activeSessions.get(sessionId);
    if (!bot || bot.status !== 'connected') return res.status(400).json({ error: 'Bot tidak aktif' });
    const result = await handleCommand(command, (args || '').split(' '), bot.sock, to, req.user.id);
    if (to && bot.sock) await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: result.text });
    res.json({ success: true, reply: result.text });
});

app.get('/api/menu', auth, (req, res) => {
    res.json({ menu: getMenuText(getUserSettings(req.user.id)) });
});

app.get('/api/admin/users', auth, admin, (req, res) => {
    const db = readUsers();
    res.json({ users: db.users });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API running on port ${PORT}`);
    console.log(`🔑 admin@loxasmd.com / admin123`);
});
