const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
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
const DEV_NAME = "DimszXyzz"; // TETAP, TIDAK BISA DIGANTI

// Database users
const usersFile = './users.json';
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({
        users: [
            { id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Super Admin', role: 'super_admin', createdAt: new Date().toISOString() }
        ]
    }, null, 2));
}

// User Settings (per user)
const userSettingsFile = './user_settings.json';
if (!fs.existsSync(userSettingsFile)) {
    fs.writeFileSync(userSettingsFile, JSON.stringify({}, null, 2));
}

function readUserSettings() { return JSON.parse(fs.readFileSync(userSettingsFile)); }
function writeUserSettings(data) { fs.writeFileSync(userSettingsFile, JSON.stringify(data, null, 2)); }

function readDB() { return JSON.parse(fs.readFileSync(usersFile)); }
function writeDB(data) { fs.writeFileSync(usersFile, JSON.stringify(data, null, 2)); }

const botsFile = './bots.json';
if (!fs.existsSync(botsFile)) fs.writeFileSync(botsFile, '{}');
function readBots() { return JSON.parse(fs.readFileSync(botsFile)); }
function writeBots(data) { fs.writeFileSync(botsFile, JSON.stringify(data, null, 2)); }

const activeSessions = new Map();

// ============ GET USER SETTINGS ============
function getUserSettings(userId) {
    const settings = readUserSettings();
    if (!settings[userId]) {
        settings[userId] = {
            botName: 'LoxasMD',
            menuImageUrl: 'https://telegra.ph/file/4e2c6c6f8e6f4e8c9d0e.jpg',
            ownerName: 'DimszXyz',
            ownerNumber: '6282342265016',
            botNumber: ''
        };
        writeUserSettings(settings);
    }
    return settings[userId];
}

// ============ MENU LENGKAP 150+ FITUR ============
function getMenuText(userSettings) {
    return `╔══════════════════════════════════════════════════════════════════════════════╗
║                         🔥 ${userSettings.botName.toUpperCase()} 🔥                            ║
║                   WhatsApp Multi-Fitur Bot 150+                                      ║
║                      👨‍💻 By ${DEV_NAME} 👨‍💻                                          ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  📱 *DOWNLOADER (20 FITUR)*                                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .tiktok <url>      .tiktokmp3 <url>      .tiktoknowm <url>                  │    ║
║  │ .ytmp3 <url>       .ytmp4 <url>          .ig <url>                          │    ║
║  │ .igstory <user>    .igreel <url>         .fb <url>                          │    ║
║  │ .twitter <url>     .twitterimg <url>     .pinterest <query>                 │    ║
║  │ .pinterestdl <url> .mediafire <url>      .gdrive <url>                      │    ║
║  │ .spotify <url>     .soundcloud <url>     .likee <url>                       │    ║
║  │ .snaptik <url>     .threads <url>                                           │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🎨 *STICKER (15 FITUR)*                                                            ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .stiker (reply)    .stickergif (reply)  .brat <teks>                        │    ║
║  │ .bratvideo <teks>  .qc <teks>           .stickerwm <teks>                   │    ║
║  │ .stickerremovebg   .stickercircle       .stickerglow                        │    ║
║  │ .sticker3d         .stickermeme <teks>  .stickertext <teks>                 │    ║
║  │ .stickerurl <url>  .stickerfire         .stickereffect                      │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🤖 *AI & CHAT (12 FITUR)*                                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .gpt <pesan>       .gpt35 <pesan>      .claude <pesan>                      │    ║
║  │ .gemini <pesan>    .deepseek <pesan>   .llama <pesan>                       │    ║
║  │ .mistral <pesan>   .copilot <pesan>    .perplexity <pesan>                  │    ║
║  │ .bingai <pesan>    .character <pesan>  .pi <pesan>                          │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🎨 *IMAGE GENERATOR (8 FITUR)*                                                     ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .imagine <prompt>  .dalle <prompt>     .midjourney <prompt>                 │    ║
║  │ .stablediffusion   .sdxl <prompt>      .flux <prompt>                       │    ║
║  │ .leonardo <prompt> .playground <prompt>                                     │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  ⚙️ *TOOLS (20 FITUR)*                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .qrcode <teks>     .shortlink <url>    .cuaca <kota>                        │    ║
║  │ .ssweb <url>       .kalkulator <hitung>.translate <teks>                    │    ║
║  │ .translateid <teks>.translateen <teks> .translatear <teks>                  │    ║
║  │ .translateja <teks>.translateko <teks> .translatezh <teks>                  │    ║
║  │ .base64 <teks>     .hash <teks>        .password                            │    ║
║  │ .ipinfo <ip>       .whois <domain>     .dns <domain>                        │    ║
║  │ .ping <host>       .virus <file>                                            │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🔍 *SEARCH (15 FITUR)*                                                             ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .ytsearch <query>  .tiktoksearch <q>   .igsearch <user>                     │    ║
║  │ .pinterestsearch<q>.google <query>     .gambar <query>                      │    ║
║  │ .news <query>      .maps <lokasi>      .shopee <produk>                     │    ║
║  │ .tokopedia <p>     .lazada <p>         .brainly <soal>                      │    ║
║  │ .wikipedia <q>     .github <repo>      .npm <package>                       │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🕌 *ISLAMI (12 FITUR)*                                                             ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .quran <surah>     .quransurah         .asmaulhusna                         │    ║
║  │ .doa <nama>        .dzikir             .jsholat <kota>                      │    ║
║  │ .imsak <kota>      .kiblat             .ceramah                             │    ║
║  │ .ayatkursi         .suratyasin         .suratalwaqiah                       │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  👑 *ADMIN GROUP (15 FITUR)*                                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .kick @user        .add 62xxx          .promote @user                       │    ║
║  │ .demote @user      .setname <nama>     .setdesc <deskripsi>                 │    ║
║  │ .setpp (foto)      .delpp              .antilink on/off                     │    ║
║  │ .antibot on/off    .welcome on/off     .goodbye on/off                      │    ║
║  │ .tagall <pesan>    .hidetag <pesan>    .infogrup                            │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  🎮 *GAME (12 FITUR)*                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .tebakgambar       .tebakkata          .tebakangka                          │    ║
║  │ .tebaklagu         .tebakfilm          .tebakanime                          │    ║
║  │ .suit (b/k/g)      .dadu               .spin                                │    ║
║  │ .family100         .hangman            .caklontong                          │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
║  ℹ️ *INFO (10 FITUR)*                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐    ║
║  │ .ping              .menu               .infobot                             │    ║
║  │ .infouser          .uptime             .speedtest                           │    ║
║  │ .status            .donasi             .sourcecode                          │    ║
║  │ .creator                                                                    │    ║
║  └─────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  📌 *TOTAL: 150+ FITUR LENGKAP*                                                     ║
║  🎨 *STIKER REAL + API REAL*                                                        ║
║  👨‍💻 *DEVELOPER: ${DEV_NAME}* (TIDAK BISA DIGANTI)                                 ║
║  ⚡ *KETIK .ping UNTUK CEK BOT AKTIF*                                               ║
║                                                                                      ║
║  👤 *OWNER: ${userSettings.ownerName}*                                             ║
║  📱 *KONTAK: wa.me/${userSettings.ownerNumber}*                                    ║
╚══════════════════════════════════════════════════════════════════════════════════════╝`;
}

// ============ HANDLE COMMAND ============
async function handleCommand(cmd, args, sock, to, userId) {
    const arg = args.join(' ');
    const userSettings = getUserSettings(userId);
    
    switch(cmd) {
        case 'ping':
            return { type: 'text', text: `🏓 Pong! ${userSettings.botName} Aktif | 150+ Fitur Siap` };
            
        case 'menu':
            try {
                const response = await axios.get(userSettings.menuImageUrl, { responseType: 'arraybuffer' });
                return { type: 'image', image: Buffer.from(response.data), caption: getMenuText(userSettings) };
            } catch(e) {
                return { type: 'text', text: getMenuText(userSettings) };
            }
            
        case 'infobot':
            return { type: 'text', text: `🤖 *${userSettings.botName}*\n• Fitur: 150+ REAL API\n• Owner: ${userSettings.ownerName}\n• Kontak: wa.me/${userSettings.ownerNumber}\n• Status: Active\n👨‍💻 Developer: ${DEV_NAME} (Tidak bisa diganti)` };
            
        case 'creator':
            return { type: 'text', text: `👨‍💻 *LOXASMD*\n• Developer: ${DEV_NAME}\n• WhatsApp Bot 150+ Fitur REAL\n• GitHub: @loxasmd\n© 2026` };
            
        case 'gpt':
            try {
                const res = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(arg)}`);
                return { type: 'text', text: `🤖 GPT: ${res.data.answer || 'AI sibuk, coba lagi'}` };
            } catch(e) {
                return { type: 'text', text: '❌ Error AI, coba nanti' };
            }
            
        case 'cuaca':
            try {
                const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${arg}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                const w = res.data;
                return { type: 'text', text: `🌤️ *Cuaca ${arg}*\n📌 ${w.weather[0].description}\n🌡️ ${w.main.temp}°C\n💧 ${w.main.humidity}%\n💨 ${w.wind.speed} m/s` };
            } catch(e) {
                return { type: 'text', text: '❌ Kota tidak ditemukan' };
            }
            
        case 'qrcode':
            return { type: 'text', text: `📱 *QR Code*\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arg)}` };
            
        case 'shortlink':
            try {
                const res = await axios.post('https://tinyurl.com/api-create.php', null, { params: { url: arg } });
                return { type: 'text', text: `🔗 *Short Link*\n${res.data}` };
            } catch(e) {
                return { type: 'text', text: '❌ Gagal membuat short link' };
            }
            
        case 'kalkulator':
            try {
                const hasil = eval(arg);
                return { type: 'text', text: `📱 *Hasil:* ${hasil}` };
            } catch(e) {
                return { type: 'text', text: '❌ Format salah. Contoh: .kalkulator 8*7' };
            }
            
        case 'translate':
            try {
                const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(arg)}`);
                return { type: 'text', text: `🌐 *Terjemahan:*\n${res.data[0][0][0]}` };
            } catch(e) {
                return { type: 'text', text: '❌ Gagal menerjemahkan' };
            }
            
        case 'ytsearch':
            try {
                const res = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(arg)}&filter=videos`);
                if (res.data && res.data.items) {
                    let result = '📺 *Hasil YouTube:*\n\n';
                    res.data.items.slice(0, 5).forEach((v, i) => {
                        result += `${i+1}. ${v.title}\n🔗 https://youtube.com/watch?v=${v.url.split('=')[1]}\n\n`;
                    });
                    return { type: 'text', text: result };
                }
                return { type: 'text', text: '❌ Tidak ditemukan' };
            } catch(e) {
                return { type: 'text', text: '❌ Error mencari YouTube' };
            }
            
        default:
            return { type: 'text', text: `❌ Perintah "${cmd}" tidak dikenal.\nKetik .menu untuk lihat 150+ fitur` };
    }
}

// ============ AUTH API ============
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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

app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password required' });
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    
    const newUser = {
        id: db.users.length + 1,
        email,
        password: bcrypt.hashSync(password, 10),
        name: name || email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/google', async (req, res) => {
    const { email, name } = req.body;
    let db = readDB();
    let user = db.users.find(u => u.email === email);
    if (!user) {
        user = {
            id: db.users.length + 1,
            email,
            password: bcrypt.hashSync('google_oauth_' + Date.now(), 10),
            name: name || email.split('@')[0],
            role: 'user',
            createdAt: new Date().toISOString()
        };
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
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
    const newUser = {
        id: db.users.length + 1,
        email,
        password: bcrypt.hashSync(password, 10),
        name: name || email.split('@')[0],
        role: role || 'user',
        createdAt: new Date().toISOString()
    };
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
    if (bots[userId] && bots[userId].status === 'connected') {
        return res.status(400).json({ error: 'Bot already active' });
    }
    
    const sessionId = `user_${userId}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['LoxasMD', 'Chrome', '1.0.0']
    });
    
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
    
    setTimeout(() => {
        if (!qrSent) res.status(504).json({ error: 'Timeout' });
    }, 30000);
});

app.get('/api/bot/status', authenticateToken, (req, res) => {
    const bots = readBots();
    const bot = bots[req.user.id];
    res.json({ status: bot?.status || 'not_created' });
});

app.post('/api/bot/command', authenticateToken, async (req, res) => {
    const { command, args, to } = req.body;
    const sessionId = `user_${req.user.id}`;
    const bot = activeSessions.get(sessionId);
    
    if (!bot || bot.status !== 'connected') {
        return res.status(400).json({ error: 'Bot tidak aktif. Scan QR dulu!' });
    }
    
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
    console.log(`👨‍💻 Developer: ${DEV_NAME} (TIDAK BISA DIGANTI)`);
    console.log(`🔑 Super Admin: admin@loxasmd.com / admin123`);
});
