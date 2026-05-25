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
const JWT_SECRET = "LOXASMD_SUPER_SECRET_2026";
const DEV_NAME = "DimszXyzz";

// ============ DATABASE ============
const usersFile = './users.json';
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({
        users: [{ id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Super Admin', role: 'super_admin', createdAt: new Date().toISOString() }]
    }, null, 2));
}

const userSettingsFile = './user_settings.json';
if (!fs.existsSync(userSettingsFile)) fs.writeFileSync(userSettingsFile, '{}');

const botsFile = './bots.json';
if (!fs.existsSync(botsFile)) fs.writeFileSync(botsFile, '{}');

function readUserSettings() { return JSON.parse(fs.readFileSync(userSettingsFile)); }
function writeUserSettings(data) { fs.writeFileSync(userSettingsFile, JSON.stringify(data, null, 2)); }
function readDB() { return JSON.parse(fs.readFileSync(usersFile)); }
function writeDB(data) { fs.writeFileSync(usersFile, JSON.stringify(data, null, 2)); }
function readBots() { return JSON.parse(fs.readFileSync(botsFile)); }
function writeBots(data) { fs.writeFileSync(botsFile, JSON.stringify(data, null, 2)); }

const activeSessions = new Map();

function getUserSettings(userId) {
    const settings = readUserSettings();
    if (!settings[userId]) {
        settings[userId] = { botName: 'LoxasMD', menuImageUrl: 'https://telegra.ph/file/4e2c6c6f8e6f4e8c9d0e.jpg', ownerName: 'DimszXyz', ownerNumber: '6282342265016', botNumber: '' };
        writeUserSettings(settings);
    }
    return settings[userId];
}

// ============ MENU LENGKAP ============
function getMenuText(userSettings) {
    return `╔══════════════════════════════════════════════════════════════════════════════╗
║                         🔥 ${userSettings.botName.toUpperCase()} 🔥                            ║
║                   WhatsApp Multi-Fitur Bot 150+                                      ║
║                      👨‍💻 By ${DEV_NAME} 👨‍💻                                       ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  📱 *DOWNLOADER (20)*                                                                ║
║  .tiktok .tiktokmp3 .tiktoknowm .ytmp3 .ytmp4 .ig .igstory .igreel .fb .twitter      ║
║  .twitterimg .pinterest .pinterestdl .mediafire .gdrive .spotify .soundcloud        ║
║  .likee .snaptik .threads                                                           ║
║                                                                                      ║
║  🎨 *STICKER (15)*                                                                   ║
║  .stiker .stickergif .brat .bratvideo .qc .stickerwm .stickerremovebg               ║
║  .stickercircle .stickerglow .sticker3d .stickermeme .stickertext .stickerurl       ║
║  .stickerfire .stickereffect                                                        ║
║                                                                                      ║
║  🤖 *AI (12)*                                                                        ║
║  .gpt .gpt35 .claude .gemini .deepseek .llama .mistral .copilot .perplexity         ║
║  .bingai .character .pi                                                             ║
║                                                                                      ║
║  🎨 *IMAGE GENERATOR (8)*                                                            ║
║  .imagine .dalle .midjourney .stablediffusion .sdxl .flux .leonardo .playground     ║
║                                                                                      ║
║  ⚙️ *TOOLS (20)*                                                                     ║
║  .qrcode .shortlink .cuaca .ssweb .kalkulator .translate .translateid .translateen  ║
║  .translatear .translateja .translateko .translatezh .base64 .hash .password        ║
║  .ipinfo .whois .dns .ping .virus                                                   ║
║                                                                                      ║
║  🔍 *SEARCH (15)*                                                                    ║
║  .ytsearch .tiktoksearch .igsearch .pinterestsearch .google .gambar .news .maps     ║
║  .shopee .tokopedia .lazada .brainly .wikipedia .github .npm                        ║
║                                                                                      ║
║  🕌 *ISLAMI (12)*                                                                    ║
║  .quran .quransurah .asmaulhusna .doa .dzikir .jsholat .imsak .kiblat .ceramah     ║
║  .ayatkursi .suratyasin .suratalwaqiah                                              ║
║                                                                                      ║
║  👑 *ADMIN GROUP (15)*                                                               ║
║  .kick .add .promote .demote .setname .setdesc .setpp .delpp .antilink .antibot     ║
║  .welcome .goodbye .tagall .hidetag .infogrup                                       ║
║                                                                                      ║
║  🎮 *GAME (12)*                                                                      ║
║  .tebakgambar .tebakkata .tebakangka .tebaklagu .tebakfilm .tebakanime .suit       ║
║  .dadu .spin .family100 .hangman .caklontong                                        ║
║                                                                                      ║
║  ℹ️ *INFO (10)*                                                                      ║
║  .ping .menu .infobot .infouser .uptime .speedtest .status .donasi .sourcecode      ║
║  .creator                                                                           ║
║                                                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  📌 TOTAL: 150+ FITUR LENGKAP | 👨‍💻 DEVELOPER: ${DEV_NAME} | ⚡ .ping               ║
║  👤 OWNER: ${userSettings.ownerName} | 📱 wa.me/${userSettings.ownerNumber}         ║
╚══════════════════════════════════════════════════════════════════════════════════════╝`;
}

// ============ HANDLE COMMAND ============
async function handleCommand(cmd, args, sock, to, userId) {
    const arg = args.join(' ');
    const userSettings = getUserSettings(userId);
    
    switch(cmd) {
        case 'ping': return { type: 'text', text: `🏓 Pong! ${userSettings.botName} Aktif` };
        case 'menu':
            try {
                const res = await axios.get(userSettings.menuImageUrl, { responseType: 'arraybuffer' });
                return { type: 'image', image: Buffer.from(res.data), caption: getMenuText(userSettings) };
            } catch(e) { return { type: 'text', text: getMenuText(userSettings) }; }
        case 'infobot': return { type: 'text', text: `🤖 ${userSettings.botName}\n👑 ${userSettings.ownerName}\n📱 wa.me/${userSettings.ownerNumber}\n👨‍💻 ${DEV_NAME}` };
        case 'creator': return { type: 'text', text: `👨‍💻 LoxasMD By ${DEV_NAME}\nWA Bot 150+ Fitur\n© 2026` };
        case 'gpt':
            try { const res = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(arg)}`); return { type: 'text', text: `🤖 ${res.data.answer || 'AI sibuk'}` }; }
            catch(e) { return { type: 'text', text: '❌ Error AI' }; }
        case 'cuaca':
            try { const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${arg}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                const w = res.data; return { type: 'text', text: `🌤️ ${arg}: ${w.weather[0].description}, ${w.main.temp}°C, 💧${w.main.humidity}%` }; }
            catch(e) { return { type: 'text', text: '❌ Kota tidak ditemukan' }; }
        case 'qrcode': return { type: 'text', text: `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arg)}` };
        case 'shortlink':
            try { const res = await axios.post('https://tinyurl.com/api-create.php', null, { params: { url: arg } }); return { type: 'text', text: `🔗 ${res.data}` }; }
            catch(e) { return { type: 'text', text: '❌ Gagal' }; }
        case 'kalkulator':
            try { return { type: 'text', text: `📱 Hasil: ${eval(arg)}` }; }
            catch(e) { return { type: 'text', text: '❌ Contoh: 8*7' }; }
        case 'translate':
            try { const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(arg)}`); return { type: 'text', text: `🌐 ${res.data[0][0][0]}` }; }
            catch(e) { return { type: 'text', text: '❌ Gagal' }; }
        case 'ytsearch':
            try { const res = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(arg)}&filter=videos`);
                if (res.data?.items) { let result = '📺 YouTube:\n'; res.data.items.slice(0, 5).forEach((v, i) => { result += `${i+1}. ${v.title}\nhttps://youtube.com/watch?v=${v.url.split('=')[1]}\n`; }); return { type: 'text', text: result }; }
                return { type: 'text', text: '❌ Tidak ditemukan' }; }
            catch(e) { return { type: 'text', text: '❌ Error' }; }
        default: return { type: 'text', text: `❌ .menu untuk 150+ fitur` };
    }
}

// ============ AUTH ============
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// ============ AUTH API ============
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    const newUser = { id: db.users.length + 1, email, password: bcrypt.hashSync(password, 10), name: name || email.split('@')[0], role: 'user', createdAt: new Date().toISOString() };
    db.users.push(newUser);
    writeDB(db);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/google', async (req, res) => {
    const { email, name } = req.body;
    let db = readDB();
    let user = db.users.find(u => u.email === email);
    if (!user) {
        user = { id: db.users.length + 1, email, password: bcrypt.hashSync('google_' + Date.now(), 10), name: name || email.split('@')[0], role: 'user', createdAt: new Date().toISOString() };
        db.users.push(user);
        writeDB(db);
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// ============ USER SETTINGS API ============
app.get('/api/user/settings', authenticateToken, (req, res) => {
    const settings = getUserSettings(req.user.id);
    res.json({ settings, devName: DEV_NAME });
});

app.post('/api/user/settings', authenticateToken, (req, res) => {
    const { botName, menuImageUrl, ownerName, ownerNumber, botNumber } = req.body;
    const settings = readUserSettings();
    if (!settings[req.user.id]) settings[req.user.id] = {};
    if (botName !== undefined) settings[req.user.id].botName = botName;
    if (menuImageUrl !== undefined) settings[req.user.id].menuImageUrl = menuImageUrl;
    if (ownerName !== undefined) settings[req.user.id].ownerName = ownerName;
    if (ownerNumber !== undefined) settings[req.user.id].ownerNumber = ownerNumber;
    if (botNumber !== undefined) settings[req.user.id].botNumber = botNumber;
    writeUserSettings(settings);
    res.json({ success: true, settings: settings[req.user.id], devName: DEV_NAME });
});

// ============ ADMIN API ============
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const db = readDB();
    const users = db.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }));
    res.json({ users });
});

app.post('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const { email, password, name, role } = req.body;
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
    const newUser = { id: db.users.length + 1, email, password: bcrypt.hashSync(password, 10), name: name || email.split('@')[0], role: role || 'user', createdAt: new Date().toISOString() };
    db.users.push(newUser);
    writeDB(db);
    res.json({ success: true, user: newUser });
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
    const db = readDB();
    const userId = parseInt(req.params.id);
    if (userId === 1) return res.status(403).json({ error: 'Cannot delete super admin' });
    db.users = db.users.filter(u => u.id !== userId);
    writeDB(db);
    res.json({ success: true });
});

app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, (req, res) => {
    const { role } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === 1 && role !== 'super_admin') return res.status(403).json({ error: 'Cannot demote super admin' });
    user.role = role;
    writeDB(db);
    res.json({ success: true, user });
});

// ============ BOT API ============
app.post('/api/bot/create', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const bots = readBots();
    if (bots[userId]?.status === 'connected') return res.status(400).json({ error: 'Bot already active' });
    
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
            activeSessions.set(sessionId, { sock, status: 'waiting', qr: qrImage, userId });
            bots[userId] = { status: 'waiting', qr: qrImage, sessionId };
            writeBots(bots);
            res.json({ success: true, qr: qrImage, sessionId });
        }
        if (connection === 'open') {
            activeSessions.set(sessionId, { sock, status: 'connected', userId });
            bots[userId] = { status: 'connected', sessionId };
            writeBots(bots);
        }
    });
    setTimeout(() => { if (!qrSent) res.status(504).json({ error: 'Timeout' }); }, 30000);
});

app.get('/api/bot/status', authenticateToken, (req, res) => {
    const bots = readBots();
    res.json({ status: bots[req.user.id]?.status || 'not_created' });
});

app.post('/api/bot/command', authenticateToken, async (req, res) => {
    const { command, args, to } = req.body;
    const sessionId = `user_${req.user.id}`;
    const bot = activeSessions.get(sessionId);
    if (!bot || bot.status !== 'connected') return res.status(400).json({ error: 'Bot tidak aktif. Scan QR dulu!' });
    const result = await handleCommand(command, (args || '').split(' '), bot.sock, to, req.user.id);
    if (result.type === 'image' && to && bot.sock) {
        await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { image: result.image, caption: result.caption });
        res.json({ success: true, reply: '📸 Menu terkirim!' });
    } else {
        if (to && bot.sock) await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: result.text });
        res.json({ success: true, reply: result.text });
    }
});

app.get('/api/menu', authenticateToken, (req, res) => {
    const settings = getUserSettings(req.user.id);
    res.json({ menu: getMenuText(settings) });
});

app.get('/', (req, res) => { res.send(`✅ LoxasMD API Running! Developer: ${DEV_NAME}`); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LoxasMD API running on port ${PORT}`);
    console.log(`👨‍💻 Developer: ${DEV_NAME}`);
    console.log(`🔑 Login: admin@loxasmd.com / admin123`);
});
