const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "LOXASMD_SECRET";

// User sementara
let users = [{ id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Admin', role: 'admin' }];
let settings = {};

function getMenu() {
    return `╔════════════════════════════════════════╗
║          🔥 LOXASMD BOT 🔥              ║
║       WhatsApp Bot 200+ Fitur           ║
║         👨‍💻 By DimszXyzz 👨‍💻          ║
╠════════════════════════════════════════╣
║ 📱 .tiktok .ig .fb .ytmp3 .ytmp4      ║
║ 🎨 .stiker .brat .qc                  ║
║ 🤖 .gpt .cuaca .qrcode                ║
║ ⚙️ .kalkulator .translate             ║
║ 🔍 .ytsearch .pinterest               ║
║ 🕌 .jsholat .quran                    ║
║ 👑 .kick .promote .tagall             ║
║ 🎮 .tebakgambar .suit .dadu           ║
║ ℹ️ .ping .menu .infobot .creator      ║
╚════════════════════════════════════════╝
📌 TOTAL 200+ FITUR | ⚡ .ping | 👨‍💻 DimszXyzz`;
}

// Auth
app.post('/api/auth/register', (req, res) => {
    let { email, password, name } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    let newUser = { id: users.length + 1, email, password: bcrypt.hashSync(password, 10), name: name || email.split('@')[0], role: 'user' };
    users.push(newUser);
    let token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    let { email, password } = req.body;
    let user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Email atau password salah' });
    let token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user });
});

app.get('/api/auth/me', (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let user = users.find(u => u.id === decoded.id);
        res.json({ user });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

// Settings
app.get('/api/user/settings', (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let userSetting = settings[decoded.id] || { botName: 'LoxasMD', ownerName: 'DimszXyz', ownerNumber: '6282342265016', menuImageUrl: '' };
        res.json({ settings: userSetting, devName: 'DimszXyzz' });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.post('/api/user/settings', (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let { botName, ownerName, ownerNumber, menuImageUrl } = req.body;
        if (!settings[decoded.id]) settings[decoded.id] = {};
        if (botName !== undefined) settings[decoded.id].botName = botName;
        if (ownerName !== undefined) settings[decoded.id].ownerName = ownerName;
        if (ownerNumber !== undefined) settings[decoded.id].ownerNumber = ownerNumber;
        if (menuImageUrl !== undefined) settings[decoded.id].menuImageUrl = menuImageUrl;
        res.json({ success: true });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

// QR
let qrCache = {};

app.post('/api/bot/create', async (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); } catch(e) { return res.status(401).json({ error: 'Invalid token' }); }
    let userId = decoded.id;
    let sessionId = `user_${userId}`;

    if (qrCache[sessionId]) {
        return res.json({ success: true, qr: qrCache[sessionId], sessionId });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
        const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ['LoxasMD', 'Chrome', '1.0.0'] });
        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { qr, connection } = update;
            if (qr && !qrCache[sessionId]) {
                const qrImage = await QRCode.toDataURL(qr);
                qrCache[sessionId] = qrImage;
                if (!res.headersSent) res.json({ success: true, qr: qrImage, sessionId });
            }
            if (connection === 'open') console.log(`✅ Bot connected: ${userId}`);
        });

        setTimeout(() => {
            if (!res.headersSent) res.json({ success: false, message: 'Timeout, coba lagi' });
        }, 20000);
    } catch(e) {
        if (!res.headersSent) res.json({ success: false, message: e.message });
    }
});

app.get('/api/bot/status', (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let sessionId = `user_${decoded.id}`;
        if (qrCache[sessionId]) res.json({ status: 'waiting', qr: qrCache[sessionId] });
        else res.json({ status: 'not_created' });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.post('/api/bot/command', (req, res) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let { command, args, to } = req.body;
        let userSetting = settings[decoded.id] || {};
        let reply = '';
        switch(command) {
            case 'ping': reply = `🏓 Pong! ${userSetting.botName || 'LoxasMD'} Aktif`; break;
            case 'menu': reply = getMenu(); break;
            case 'infobot': reply = `🤖 ${userSetting.botName || 'LoxasMD'}\n👑 ${userSetting.ownerName || 'DimszXyz'}\n📱 wa.me/${userSetting.ownerNumber || '6282342265016'}\n👨‍💻 DimszXyzz`; break;
            case 'creator': reply = `👨‍💻 LoxasMD By DimszXyzz`; break;
            case 'gpt': reply = `🤖 GPT: ${args}`; break;
            case 'cuaca': reply = `🌤️ Cuaca ${args}: Cerah 30°C`; break;
            case 'qrcode': reply = `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(args)}`; break;
            case 'kalkulator': try { reply = `📱 Hasil: ${eval(args)}`; } catch(e) { reply = '❌ Contoh: 8*7'; } break;
            default: reply = `❌ Perintah tidak dikenal. Ketik .menu`;
        }
        res.json({ success: true, reply });
    } catch(e) { res.status(401).json({ error: 'Invalid token' }); }
});

app.get('/api/menu', (req, res) => res.json({ menu: getMenu() }));

app.listen(PORT, () => console.log(`✅ API running on port ${PORT} | admin@loxasmd.com / admin123`));
