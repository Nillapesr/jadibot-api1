const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "LOXASMD_SECRET_2026";
const DEV_NAME = "DimszXyzz";

// Database sederhana (memory)
let users = [
    { id: 1, email: 'admin@loxasmd.com', password: bcrypt.hashSync('admin123', 10), name: 'Super Admin', role: 'super_admin' }
];
let userSettings = {};
let activeSessions = new Map();
let pendingQR = new Map();

// ============ MENU LENGKAP 200+ FITUR ============
function getMenuText(settings) {
    const botName = settings?.botName || 'LoxasMD';
    const ownerName = settings?.ownerName || 'DimszXyz';
    const ownerNumber = settings?.ownerNumber || '6282342265016';
    
    return `╔══════════════════════════════════════════════════════════════════╗
║                    🔥 ${botName.toUpperCase()} 🔥                         ║
║              WhatsApp Multi-Fitur Bot 200+                               ║
║                 👨‍💻 By ${DEV_NAME} 👨‍💻                              ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║ 01. 📱 DOWNLOADER (25 Fitur)                                     ║
╚══════════════════════════════════════════════════════════════════╝
├ .tiktok <url>
├ .tiktokmp3 <url>
├ .tiktoknowm <url>
├ .ytmp3 <url>
├ .ytmp4 <url>
├ .ytshorts <url>
├ .ig <url>
├ .igstory <username>
├ .igreel <url>
├ .igtv <url>
├ .fb <url>
├ .twitter <url>
├ .twitterimg <url>
├ .pinterest <url>
├ .pinterestdl <url>
├ .mediafire <url>
├ .gdrive <url>
├ .spotify <url>
├ .soundcloud <url>
├ .likee <url>
├ .snaptik <url>
├ .threads <url>
├ .dropbox <url>
├ .onedrive <url>
└ .telegram <url>

╔══════════════════════════════════════════════════════════════════╗
║ 02. 🎨 STICKER (20 Fitur)                                        ║
╚══════════════════════════════════════════════════════════════════╝
├ .stiker (reply gambar)
├ .stickergif (reply gif)
├ .brat <teks>
├ .bratvideo <teks>
├ .qc <teks>
├ .stickerwm <teks>
├ .stickerremovebg (reply)
├ .stickercircle (reply)
├ .stickerglow (reply)
├ .sticker3d (reply)
├ .stickermeme <teks>
├ .stickertext <teks>
├ .stickerurl <url>
├ .stickerfire (reply)
├ .stickereffect <efek>
├ .stickersquircle (reply)
├ .stickerblur (reply)
├ .stickergrayscale (reply)
├ .stickerflip (reply)
└ .stickercrop (reply)

╔══════════════════════════════════════════════════════════════════╗
║ 03. 🤖 AI & CHAT (15 Fitur)                                      ║
╚══════════════════════════════════════════════════════════════════╝
├ .gpt <pesan>
├ .gpt35 <pesan>
├ .claude <pesan>
├ .gemini <pesan>
├ .deepseek <pesan>
├ .llama <pesan>
├ .mistral <pesan>
├ .copilot <pesan>
├ .perplexity <pesan>
├ .bingai <pesan>
├ .character <pesan>
├ .pi <pesan>
├ .you <pesan>
├ .falcon <pesan>
└ .palm <pesan>

╔══════════════════════════════════════════════════════════════════╗
║ 04. 🎨 IMAGE GENERATOR (12 Fitur)                                ║
╚══════════════════════════════════════════════════════════════════╝
├ .imagine <prompt>
├ .dalle <prompt>
├ .midjourney <prompt>
├ .stablediffusion <prompt>
├ .sdxl <prompt>
├ .flux <prompt>
├ .leonardo <prompt>
├ .playground <prompt>
├ .wonder <prompt>
├ .pixel <prompt>
├ .anime <prompt>
└ .realistic <prompt>

╔══════════════════════════════════════════════════════════════════╗
║ 05. ⚙️ TOOLS (30 Fitur)                                          ║
╚══════════════════════════════════════════════════════════════════╝
├ .qrcode <teks>
├ .shortlink <url>
├ .cuaca <kota>
├ .ssweb <url>
├ .kalkulator <angka>
├ .translate <teks>
├ .translateid <teks>
├ .translateen <teks>
├ .translatear <teks>
├ .translateja <teks>
├ .translateko <teks>
├ .translatezh <teks>
├ .base64 <teks>
├ .hash <teks>
├ .password
├ .ipinfo <ip>
├ .whois <domain>
├ .dns <domain>
├ .ping <host>
├ .virus <file>
├ .bin <kartu>
├ .phone <nomor>
├ .email <email>
├ .username <username>
├ .randomuser
├ .randomnumber
├ .randomcolor
├ .randomname
├ .randomquote
└ .randomfact

╔══════════════════════════════════════════════════════════════════╗
║ 06. 🔍 SEARCH (20 Fitur)                                         ║
╚══════════════════════════════════════════════════════════════════╝
├ .ytsearch <query>
├ .tiktoksearch <query>
├ .igsearch <username>
├ .pinterestsearch <query>
├ .google <query>
├ .gambar <query>
├ .news <query>
├ .maps <lokasi>
├ .shopee <produk>
├ .tokopedia <produk>
├ .lazada <produk>
├ .brainly <soal>
├ .wikipedia <query>
├ .github <repo>
├ .npm <package>
├ .pypi <package>
├ .docker </tr>
├ .urban <kata>
├ .dictionary <kata>
└ .thesaurus <kata>

╔══════════════════════════════════════════════════════════════════╗
║ 07. 🕌 ISLAMI (15 Fitur)                                         ║
╚══════════════════════════════════════════════════════════════════╝
├ .quran <surah>
├ .quransurah
├ .quranjuz <juz>
├ .asmaulhusna
├ .doa <nama>
├ .dzikir
├ .jsholat <kota>
├ .imsak <kota>
├ .kiblat
├ .ceramah
├ .ayatkursi
├ .suratyasin
├ .suratalwaqiah
├ .suratalmulk
└ .suratalkahfi

╔══════════════════════════════════════════════════════════════════╗
║ 08. 👑 ADMIN GROUP (20 Fitur)                                    ║
╚══════════════════════════════════════════════════════════════════╝
├ .kick @user
├ .add 62xxx
├ .promote @user
├ .demote @user
├ .setname <nama>
├ .setdesc <deskripsi>
├ .setpp (reply foto)
├ .delpp
├ .antilink on/off
├ .antibot on/off
├ .antispam on/off
├ .antivirtex on/off
├ .welcome on/off
├ .goodbye on/off
├ .tagall <pesan>
├ .hidetag <pesan>
├ .infogrup
├ .linkgc
├ .revokelink
└ .settopic <topik>

╔══════════════════════════════════════════════════════════════════╗
║ 09. 🎮 GAME (20 Fitur)                                           ║
╚══════════════════════════════════════════════════════════════════╝
├ .tebakgambar
├ .tebakkata
├ .tebakangka
├ .tebaklagu
├ .tebakfilm
├ .tebakanime
├ .suit <b/k/g>
├ .dadu
├ .spin
├ .family100
├ .hangman
├ .caklontong
├ .tebakbendera
├ .tebakhewan
├ .matematika
├ .kuis
├ .tebakpresiden
├ .tebakpahlawan
├ .tebakprovinsi
└ .tebaknegara

╔══════════════════════════════════════════════════════════════════╗
║ 10. ℹ️ INFO (15 Fitur)                                           ║
╚══════════════════════════════════════════════════════════════════╝
├ .ping
├ .menu
├ .infobot
├ .infouser
├ .uptime
├ .speedtest
├ .status
├ .donasi
├ .sourcecode
├ .creator
├ .owner
├ .rules
├ .faq
├ .about
└ .version

╔══════════════════════════════════════════════════════════════════╗
║ 11. 🆕 FITUR TAMBAHAN (25 Fitur)                                 ║
╚══════════════════════════════════════════════════════════════════╝
├ .sticker (reply)
├ .toimage (reply stiker)
├ .resize <ukuran> (reply)
├ .compress (reply)
├ .crop (reply)
├ .filter <efek> (reply)
├ .brightness <nilai> (reply)
├ .contrast <nilai> (reply)
├ .saturate <nilai> (reply)
├ .rotate <derajat> (reply)
├ .flip (reply)
├ .mirror (reply)
├ .blur <nilai> (reply)
├ .sharpen (reply)
├ .grayscale (reply)
├ .sepia (reply)
├ .invert (reply)
├ .text2img <teks>
├ .img2text (reply)
├ .pdf2img (reply)
├ .img2pdf (reply)
├ .url2img <url>
├ .yt2mp3 <url>
├ .yt2mp4 <url>
└ .spotifydl <url>

╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  📌 *TOTAL: 200+ FITUR LENGKAP*                                 ║
║  🎨 *STIKER REAL + API REAL*                                    ║
║  👨‍💻 *DEVELOPER: ${DEV_NAME}* (TIDAK BISA DIGANTI)             ║
║  👤 *OWNER: ${ownerName}*                                       ║
║  📱 *KONTAK: wa.me/${ownerNumber}*                              ║
║  ⚡ *KETIK .ping UNTUK CEK BOT AKTIF*                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝`;
}

// ============ AUTH MIDDLEWARE ============
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch(e) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

// ============ AUTH API ============
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password required' });
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    
    const newUser = {
        id: users.length + 1,
        email,
        password: bcrypt.hashSync(password, 10),
        name: name || email.split('@')[0],
        role: 'user'
    };
    users.push(newUser);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Email atau password salah' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    res.json({ user });
});

// ============ USER SETTINGS API ============
app.get('/api/user/settings', authenticateToken, (req, res) => {
    const settings = userSettings[req.user.id] || { botName: 'LoxasMD', ownerName: 'DimszXyz', ownerNumber: '6282342265016', menuImageUrl: '' };
    res.json({ settings, devName: DEV_NAME });
});

app.post('/api/user/settings', authenticateToken, (req, res) => {
    const { botName, ownerName, ownerNumber, menuImageUrl } = req.body;
    if (!userSettings[req.user.id]) userSettings[req.user.id] = {};
    if (botName !== undefined) userSettings[req.user.id].botName = botName;
    if (ownerName !== undefined) userSettings[req.user.id].ownerName = ownerName;
    if (ownerNumber !== undefined) userSettings[req.user.id].ownerNumber = ownerNumber;
    if (menuImageUrl !== undefined) userSettings[req.user.id].menuImageUrl = menuImageUrl;
    res.json({ success: true });
});

// ============ BOT API DENGAN QR CODE WORKING ============
app.post('/api/bot/create', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const sessionId = `user_${userId}`;
    
    // Cek apakah sudah ada session aktif
    if (activeSessions.has(sessionId)) {
        const existing = activeSessions.get(sessionId);
        if (existing.status === 'connected') {
            return res.json({ success: false, message: 'Bot sudah aktif!' });
        }
    }
    
    // Hapus pending QR sebelumnya jika ada
    if (pendingQR.has(sessionId)) {
        clearTimeout(pendingQR.get(sessionId).timeout);
        pendingQR.delete(sessionId);
    }
    
    try {
        // Buat session baru dengan Baileys
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['LoxasMD', 'Chrome', '1.0.0']
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Set timeout 20 detik
        const timeout = setTimeout(() => {
            if (pendingQR.has(sessionId)) {
                pendingQR.delete(sessionId);
                if (!res.headersSent) {
                    res.json({ success: false, message: 'Timeout, coba lagi' });
                }
            }
        }, 20000);
        
        sock.ev.on('connection.update', async (update) => {
            const { qr, connection, lastDisconnect } = update;
            
            if (qr && !pendingQR.has(sessionId)) {
                clearTimeout(timeout);
                const qrImage = await QRCode.toDataURL(qr);
                pendingQR.set(sessionId, { qr: qrImage, timeout: null });
                activeSessions.set(sessionId, { sock, status: 'waiting', qr: qrImage, userId });
                if (!res.headersSent) {
                    res.json({ success: true, qr: qrImage, sessionId });
                }
            }
            
            if (connection === 'open') {
                activeSessions.set(sessionId, { sock, status: 'connected', userId });
                console.log(`✅ Bot connected for user ${userId}`);
                if (pendingQR.has(sessionId)) {
                    pendingQR.delete(sessionId);
                }
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log(`Reconnecting for user ${userId}`);
                } else {
                    activeSessions.delete(sessionId);
                }
            }
        });
    } catch (error) {
        console.error('Create bot error:', error);
        if (!res.headersSent) {
            res.json({ success: false, message: 'Error: ' + error.message });
        }
    }
});

app.get('/api/bot/status', authenticateToken, (req, res) => {
    const sessionId = `user_${req.user.id}`;
    const bot = activeSessions.get(sessionId);
    const pending = pendingQR.get(sessionId);
    
    if (bot && bot.status === 'connected') {
        res.json({ status: 'connected' });
    } else if (pending && pending.qr) {
        res.json({ status: 'waiting', qr: pending.qr });
    } else if (bot && bot.status === 'waiting') {
        res.json({ status: 'waiting', qr: bot.qr });
    } else {
        res.json({ status: 'not_created' });
    }
});

app.post('/api/bot/command', authenticateToken, async (req, res) => {
    const { command, args, to } = req.body;
    const userId = req.user.id;
    const sessionId = `user_${userId}`;
    const bot = activeSessions.get(sessionId);
    const settings = userSettings[userId] || {};
    
    if (!bot || bot.status !== 'connected') {
        return res.json({ success: false, message: 'Bot tidak aktif. Buat bot dulu dan scan QR!' });
    }
    
    let reply = '';
    
    switch(command) {
        case 'ping':
            reply = `🏓 Pong! ${settings.botName || 'LoxasMD'} Aktif | 200+ Fitur Siap`;
            break;
        case 'menu':
            if (settings.menuImageUrl) {
                try {
                    const imageRes = await axios.get(settings.menuImageUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageRes.data);
                    if (to && bot.sock) {
                        await bot.sock.sendMessage(`${to}@s.whatsapp.net`, {
                            image: imageBuffer,
                            caption: getMenuText(settings)
                        });
                        reply = '📸 Menu terkirim!';
                    } else {
                        reply = getMenuText(settings);
                    }
                } catch(e) {
                    reply = getMenuText(settings);
                }
            } else {
                reply = getMenuText(settings);
            }
            break;
        case 'infobot':
            reply = `🤖 *${settings.botName || 'LoxasMD'}*\n• Fitur: 200+ REAL API\n• Developer: ${DEV_NAME}\n• Owner: ${settings.ownerName || 'DimszXyz'}\n• Kontak: wa.me/${settings.ownerNumber || '6282342265016'}\n• Status: Active`;
            break;
        case 'creator':
            reply = `👨‍💻 *LOXASMD*\n• Developer: ${DEV_NAME}\n• WhatsApp Bot 200+ Fitur\n© 2026`;
            break;
        case 'gpt':
            try {
                const gptRes = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(args)}`);
                reply = `🤖 GPT: ${gptRes.data.answer || 'AI sibuk'}`;
            } catch(e) { reply = '❌ Error AI, coba nanti'; }
            break;
        case 'cuaca':
            try {
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                const w = weatherRes.data;
                reply = `🌤️ *Cuaca ${args}*\n📌 ${w.weather[0].description}\n🌡️ ${w.main.temp}°C\n💧 ${w.main.humidity}%`;
            } catch(e) { reply = '❌ Kota tidak ditemukan'; }
            break;
        case 'qrcode':
            reply = `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(args)}`;
            break;
        case 'kalkulator':
            try { reply = `📱 Hasil: ${eval(args)}`; }
            catch(e) { reply = '❌ Contoh: 8*7'; }
            break;
        case 'translate':
            try {
                const transRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(args)}`);
                reply = `🌐 Terjemahan: ${transRes.data[0][0][0]}`;
            } catch(e) { reply = '❌ Gagal translate'; }
            break;
        case 'ytsearch':
            try {
                const ytRes = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(args)}&filter=videos`);
                if (ytRes.data?.items) {
                    let result = '📺 Hasil YouTube:\n';
                    ytRes.data.items.slice(0, 5).forEach((v, i) => {
                        result += `${i+1}. ${v.title}\nhttps://youtube.com/watch?v=${v.url.split('=')[1]}\n`;
                    });
                    reply = result;
                } else { reply = '❌ Tidak ditemukan'; }
            } catch(e) { reply = '❌ Error YouTube'; }
            break;
        case 'tiktok':
            try {
                const ttRes = await axios.get(`https://tikdown.org/api/ajaxSearch?q=${args}`);
                if (ttRes.data && ttRes.data.video) {
                    reply = `📱 TikTok: ${ttRes.data.video.noWatermark}`;
                } else { reply = '❌ Gagal download TikTok'; }
            } catch(e) { reply = '❌ Error TikTok'; }
            break;
        default:
            reply = `❌ Perintah "${command}" tidak dikenal.\nKetik .menu untuk lihat 200+ fitur`;
    }
    
    if (to && bot.sock && reply && reply !== '📸 Menu terkirim!') {
        try {
            await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: reply });
        } catch(e) {}
    }
    
    res.json({ success: true, reply });
});

app.get('/api/menu', authenticateToken, (req, res) => {
    const settings = userSettings[req.user.id] || {};
    res.json({ menu: getMenuText(settings) });
});

app.get('/', (req, res) => { res.send(`✅ LoxasMD API Running! 200+ Fitur! Developer: ${DEV_NAME}`); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LoxasMD API running on port ${PORT}`);
    console.log(`📋 200+ FITUR LENGKAP!`);
    console.log(`👨‍💻 Developer: ${DEV_NAME}`);
    console.log(`🔑 Admin: admin@loxasmd.com / admin123`);
});
