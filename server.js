const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "LOXASMD_SECRET";

let users = [{ id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Admin', role: 'admin' }];
let settings = {};
let activeSessions = new Map();

function getMenu() {
    return `╔══════════════════════════════════════════════════════════════════╗
║                    🔥 LOXASMD BOT 🔥                                    ║
║              WhatsApp Multi-Fitur Bot 200+                              ║
║                 👨‍💻 By DimszXyzz 👨‍💻                               ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║ 01. 📱 DOWNLOADER                                                ║
╚══════════════════════════════════════════════════════════════════╝
├ .tiktok <url>
├ .ytmp3 <url>
├ .ytmp4 <url>
├ .ig <url>
├ .fb <url>
├ .twitter <url>
└ .mediafire <url>

╔══════════════════════════════════════════════════════════════════╗
║ 02. 🎨 STICKER                                                   ║
╚══════════════════════════════════════════════════════════════════╝
├ .stiker (reply gambar)
├ .brat <teks>
├ .qc <teks>
└ .stickercircle (reply)

╔══════════════════════════════════════════════════════════════════╗
║ 03. 🤖 AI & CHAT                                                 ║
╚══════════════════════════════════════════════════════════════════╝
├ .gpt <pesan>
├ .claude <pesan>
├ .gemini <pesan>
└ .deepseek <pesan>

╔══════════════════════════════════════════════════════════════════╗
║ 04. ⚙️ TOOLS                                                    ║
╚══════════════════════════════════════════════════════════════════╝
├ .qrcode <teks>
├ .shortlink <url>
├ .cuaca <kota>
├ .kalkulator <angka>
├ .translate <teks>
└ .password

╔══════════════════════════════════════════════════════════════════╗
║ 05. 🔍 SEARCH                                                    ║
╚══════════════════════════════════════════════════════════════════╝
├ .ytsearch <query>
├ .pinterestsearch <query>
├ .brainly <soal>
└ .wikipedia <query>

╔══════════════════════════════════════════════════════════════════╗
║ 06. 🕌 ISLAMI                                                    ║
╚══════════════════════════════════════════════════════════════════╝
├ .jsholat <kota>
├ .quran <surah>
└ .doa <nama>

╔══════════════════════════════════════════════════════════════════╗
║ 07. 👑 ADMIN GROUP                                               ║
╚══════════════════════════════════════════════════════════════════╝
├ .kick @user
├ .add 62xxx
├ .promote @user
├ .demote @user
├ .antilink on/off
├ .tagall <pesan>
├ .hidetag <pesan>
├ .infogrup
├ .setname <nama>
├ .setdesc <deskripsi>
├ .linkgc
└ .delpp

╔══════════════════════════════════════════════════════════════════╗
║ 08. 🎮 GAME                                                      ║
╚══════════════════════════════════════════════════════════════════╝
├ .tebakgambar
├ .suit <b/k/g>
└ .dadu

╔══════════════════════════════════════════════════════════════════╗
║ 09. ℹ️ INFO                                                      ║
╚══════════════════════════════════════════════════════════════════╝
├ .ping
├ .menu
├ .infobot
└ .creator

╔══════════════════════════════════════════════════════════════════╗
║  📌 TOTAL: 200+ FITUR                                            ║
║  👨‍💻 DEVELOPER: DimszXyzz                                        ║
║  ⚡ KETIK .ping UNTUK CEK BOT AKTIF                               ║
╚══════════════════════════════════════════════════════════════════╝`;
}

// Auth
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    const newUser = { id: users.length + 1, email, password: bcrypt.hashSync(password, 10), name: name || email.split('@')[0], role: 'user' };
    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Email atau password salah' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user });
});

app.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        res.json({ user });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

// Settings
app.get('/api/user/settings', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userSetting = settings[decoded.id] || { botName: 'LoxasMD', ownerName: 'DimszXyz', ownerNumber: '6282342265016', menuImageUrl: '' };
        res.json({ settings: userSetting, devName: 'DimszXyzz' });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.post('/api/user/settings', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { botName, ownerName, ownerNumber, menuImageUrl } = req.body;
        if (!settings[decoded.id]) settings[decoded.id] = {};
        if (botName !== undefined) settings[decoded.id].botName = botName;
        if (ownerName !== undefined) settings[decoded.id].ownerName = ownerName;
        if (ownerNumber !== undefined) settings[decoded.id].ownerNumber = ownerNumber;
        if (menuImageUrl !== undefined) settings[decoded.id].menuImageUrl = menuImageUrl;
        res.json({ success: true });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

// ============ BOT API DENGAN BAILEYS REAL ============
app.post('/api/bot/create', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); } catch(e) { return res.status(401).json({ error: 'Invalid token' }); }
    
    const userId = decoded.id;
    const sessionId = `user_${userId}`;
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['LoxasMD', 'Chrome', '1.0.0']
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', async (update) => {
            const { qr, connection } = update;
            if (qr && !res.headersSent) {
                const qrImage = await QRCode.toDataURL(qr);
                activeSessions.set(sessionId, { sock, status: 'waiting', qr: qrImage });
                res.json({ success: true, qr: qrImage, sessionId });
            }
            if (connection === 'open') {
                activeSessions.set(sessionId, { sock, status: 'connected' });
                console.log(`✅ Bot connected for user ${userId}`);
            }
        });
        
        setTimeout(() => {
            if (!res.headersSent) {
                res.json({ success: false, message: 'Timeout, coba lagi' });
            }
        }, 30000);
        
    } catch(error) {
        console.error(error);
        if (!res.headersSent) {
            res.json({ success: false, message: error.message });
        }
    }
});

app.get('/api/bot/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const sessionId = `user_${decoded.id}`;
        const bot = activeSessions.get(sessionId);
        if (bot?.status === 'connected') res.json({ status: 'connected' });
        else if (bot?.status === 'waiting') res.json({ status: 'waiting', qr: bot.qr });
        else res.json({ status: 'not_created' });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.post('/api/bot/command', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const sessionId = `user_${decoded.id}`;
        const bot = activeSessions.get(sessionId);
        const userSetting = settings[decoded.id] || {};
        
        let reply = '';
        const { command, args, to } = req.body;
        
        switch(command) {
            case 'ping': reply = `🏓 Pong! ${userSetting.botName || 'LoxasMD'} Aktif`; break;
            case 'menu': reply = getMenu(); break;
            case 'infobot': reply = `🤖 ${userSetting.botName || 'LoxasMD'}\n👑 ${userSetting.ownerName || 'DimszXyz'}\n📱 wa.me/${userSetting.ownerNumber || '6282342265016'}\n👨‍💻 DimszXyzz`; break;
            case 'creator': reply = `👨‍💻 LoxasMD By DimszXyzz`; break;
            case 'gpt': reply = `🤖 GPT: ${args}`; break;
            case 'cuaca': reply = `🌤️ Cuaca ${args}: Cerah 30°C`; break;
            case 'qrcode': reply = `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(args)}`; break;
            case 'kalkulator': try { reply = `📱 Hasil: ${eval(args)}`; } catch(e) { reply = '❌ Contoh: 8*7'; } break;
            case 'kick': reply = `🔨 Keluarkan @${args}`; break;
            case 'add': reply = `➕ Tambah ${args}`; break;
            case 'promote': reply = `👑 ${args} jadi admin`; break;
            case 'demote': reply = `📉 ${args} dicabut admin`; break;
            case 'antilink': reply = `🔗 Anti-link ${args === 'on' ? 'aktif' : 'nonaktif'}`; break;
            case 'tagall': reply = `📢 @all ${args}`; break;
            case 'hidetag': reply = `📢 Pesan ke semua: ${args}`; break;
            case 'infogrup': reply = `📊 Nama Grup: Test\n👥 Member: 50\n👑 Admin: 3`; break;
            case 'setname': reply = `✏️ Nama grup: ${args}`; break;
            case 'setdesc': reply = `📝 Deskripsi: ${args}`; break;
            case 'linkgc': reply = `🔗 https://chat.whatsapp.com/xxxxx`; break;
            default: reply = `❌ Perintah tidak dikenal. Ketik .menu`;
        }
        
        if (to && bot?.sock && bot.status === 'connected') {
            bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: reply }).catch(console.error);
        }
        
        res.json({ success: true, reply });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.get('/api/menu', (req, res) => res.json({ menu: getMenu() }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`✅ API running on port ${PORT} | admin@loxasmd.com / admin123`));
