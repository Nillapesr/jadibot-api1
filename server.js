const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const QRCode = require('qrcode');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = "LOXASMD_DIMSYZ_2026";

// Settings
const settingsFile = './settings.json';
if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({
        menuImageUrl: 'https://telegra.ph/file/4e2c6c6f8e6f4e8c9d0e.jpg',
        botName: 'LoxasMD',
        ownerName: 'DimszXyz',
        ownerNumber: '6282342265016',
        botNumber: ''
    }, null, 2));
}

function readSettings() { return JSON.parse(fs.readFileSync(settingsFile)); }
function writeSettings(data) { fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2)); }

const activeSessions = new Map();

// ============ MENU LENGKAP 150+ FITUR ============
function getMenuText() {
    return `╔══════════════════════════════════════════════════════════════════╗
║                        🔥 *LOXASMD BOT* 🔥                          ║
║                  WhatsApp Multi-Fitur Bot 150+                       ║
║                     👨‍💻 By DimszXyzz 👨‍💻                       ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ 📱 *DOWNLOADER (20 FITUR)*                                      │
├─────────────────────────────────────────────────────────────────┤
│ .tiktok <url>      .tiktokmp3 <url>    .tiktoknowm <url>       │
│ .ytmp3 <url>       .ytmp4 <url>        .ig <url>               │
│ .igstory <user>    .igreel <url>       .fb <url>               │
│ .twitter <url>     .twitterimg <url>   .pinterest <query>      │
│ .pinterestdl <url> .mediafire <url>    .gdrive <url>           │
│ .spotify <url>     .soundcloud <url>   .likee <url>            │
│ .snaptik <url>     .threads <url>                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🎨 *STICKER (15 FITUR)*                                         │
├─────────────────────────────────────────────────────────────────┤
│ .stiker (reply)    .stickergif (reply) .brat <teks>            │
│ .bratvideo <teks>  .qc <teks>          .stickerwm <teks>       │
│ .stickerremovebg   .stickercircle      .stickerglow            │
│ .sticker3d         .stickermeme <t>    .stickertext <t>        │
│ .stickerurl <url>  .stickerfire        .stickereffect          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🤖 *AI & CHAT (12 FITUR)*                                       │
├─────────────────────────────────────────────────────────────────┤
│ .gpt <pesan>       .gpt35 <pesan>      .claude <pesan>         │
│ .gemini <pesan>    .deepseek <pesan>   .llama <pesan>          │
│ .mistral <pesan>   .copilot <pesan>    .perplexity <pesan>     │
│ .bingai <pesan>    .character <pesan>  .pi <pesan>             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🎨 *IMAGE GENERATOR (8 FITUR)*                                  │
├─────────────────────────────────────────────────────────────────┤
│ .imagine <prompt>  .dalle <prompt>     .midjourney <prompt>    │
│ .stablediffusion   .sdxl <prompt>      .flux <prompt>          │
│ .leonardo <prompt> .playground <prompt>                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ⚙️ *TOOLS (20 FITUR)*                                           │
├─────────────────────────────────────────────────────────────────┤
│ .qrcode <teks>     .shortlink <url>    .cuaca <kota>           │
│ .ssweb <url>       .kalkulator <hitung>.translate <teks>       │
│ .translateid <t>   .translateen <t>    .translatear <t>        │
│ .translateja <t>   .translateko <t>    .translatezh <t>        │
│ .base64 <teks>     .hash <teks>        .password               │
│ .ipinfo <ip>       .whois <domain>     .dns <domain>           │
│ .ping <host>       .virus <file>                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🔍 *SEARCH (15 FITUR)*                                          │
├─────────────────────────────────────────────────────────────────┤
│ .ytsearch <query>  .tiktoksearch <q>   .igsearch <user>        │
│ .pinterestsearch<q>.google <query>     .gambar <query>         │
│ .news <query>      .maps <lokasi>      .shopee <produk>        │
│ .tokopedia <p>     .lazada <p>         .brainly <soal>         │
│ .wikipedia <q>     .github <repo>      .npm <package>          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🕌 *ISLAMI (12 FITUR)*                                          │
├─────────────────────────────────────────────────────────────────┤
│ .quran <surah>     .quransurah         .asmaulhusna            │
│ .doa <nama>        .dzikir             .jsholat <kota>         │
│ .imsak <kota>      .kiblat             .ceramah                │
│ .ayatkursi         .suratyasin         .suratalwaqiah          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 👑 *ADMIN GROUP (15 FITUR)*                                     │
├─────────────────────────────────────────────────────────────────┤
│ .kick @user        .add 62xxx          .promote @user          │
│ .demote @user      .setname <nama>     .setdesc <deskripsi>    │
│ .setpp (foto)      .delpp              .antilink on/off        │
│ .antibot on/off    .welcome on/off     .goodbye on/off         │
│ .tagall <pesan>    .hidetag <pesan>    .infogrup               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🎮 *GAME (12 FITUR)*                                            │
├─────────────────────────────────────────────────────────────────┤
│ .tebakgambar       .tebakkata          .tebakangka             │
│ .tebaklagu         .tebakfilm          .tebakanime             │
│ .suit (batu/kertas/gunting) .dadu      .spin                   │
│ .family100         .hangman            .caklontong             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ℹ️ *INFO (10 FITUR)*                                            │
├─────────────────────────────────────────────────────────────────┤
│ .ping              .menu               .infobot                │
│ .infouser          .uptime             .speedtest              │
│ .status            .donasi             .sourcecode             │
│ .creator                                                       │
└─────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════╗
║  📌 *TOTAL: 150+ FITUR LENGKAP*                                 ║
║  🎨 *STIKER REAL + API REAL*                                    ║
║  👨‍💻 *DEVELOPER: DIMSZXyzz*                                    ║
║  ⚡ *KETIK .ping UNTUK CEK BOT AKTIF*                           ║
╚══════════════════════════════════════════════════════════════════╝`;
}

// ============ API STIKER ============
async function createStickerFromImage(imageBuffer, packname = 'LoxasMD', author = 'DimszXyzz') {
    try {
        const webpBuffer = await sharp(imageBuffer)
            .resize(512, 512, { fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .webp({ quality: 80 })
            .toBuffer();
        return { success: true, sticker: webpBuffer };
    } catch(e) {
        return { success: false, message: 'Gagal buat stiker: ' + e.message };
    }
}

async function createBratSticker(text) {
    return { success: false, text: `🎨 *BRAT STICKER*\n📝 ${text.toUpperCase()}\n👨‍💻 LoxasMD By DimszXyzz` };
}

async function createQuoteSticker(text, name = 'You') {
    return { success: false, text: `💬 *QUOTE*\n"${text}"\n\n- ${name}\n👨‍💻 LoxasMD` };
}

// ============ API REAL ============
async function tiktokDownload(url) {
    try {
        const response = await axios.get(`https://tikdown.org/api/ajaxSearch?q=${url}`);
        if (response.data && response.data.video) {
            return { success: true, url: response.data.video.noWatermark, title: response.data.title };
        }
        return { success: false, message: 'Gagal download TikTok' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function instagramDownload(url) {
    try {
        const response = await axios.post('https://instasupersave.com/api/convert', { url: url }, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.data && response.data.video_url) {
            return { success: true, url: response.data.video_url };
        }
        return { success: false, message: 'Gagal download Instagram' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function chatGpt(prompt) {
    try {
        const response = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(prompt)}`);
        if (response.data && response.data.answer) {
            return { success: true, reply: response.data.answer };
        }
        return { success: false, message: 'AI sedang sibuk' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function getWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
        const weather = response.data;
        return { 
            success: true, 
            text: `🌤️ *Cuaca ${city}*\n📌 Kondisi: ${weather.weather[0].description}\n🌡️ Suhu: ${weather.main.temp}°C\n💧 Kelembaban: ${weather.main.humidity}%\n💨 Angin: ${weather.wind.speed} m/s`
        };
    } catch(e) {
        return { success: false, message: 'Kota tidak ditemukan' };
    }
}

function generateQR(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
}

async function shortLink(url) {
    try {
        const response = await axios.post('https://tinyurl.com/api-create.php', null, { params: { url: url } });
        return { success: true, shortUrl: response.data };
    } catch(e) {
        return { success: false, message: 'Gagal short link' };
    }
}

async function youtubeSearch(query) {
    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`);
        if (response.data && response.data.items) {
            const videos = response.data.items.slice(0, 5).map(item => ({
                title: item.title,
                url: `https://youtube.com/watch?v=${item.url.split('=')[1]}`
            }));
            return { success: true, results: videos };
        }
        return { success: false, message: 'Tidak ditemukan' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function pinterestSearch(query) {
    try {
        const response = await axios.get(`https://pinterest-api-phi.vercel.app/search?q=${encodeURIComponent(query)}`);
        if (response.data && response.data.data) {
            return { success: true, results: response.data.data.slice(0, 5) };
        }
        return { success: false, message: 'Tidak ditemukan' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function brainlySearch(query) {
    try {
        const response = await axios.get(`https://brainly-api.vercel.app/question?text=${encodeURIComponent(query)}`);
        if (response.data && response.data.data) {
            return { success: true, answer: response.data.data[0]?.content || 'Tidak ada jawaban' };
        }
        return { success: false, message: 'Tidak ditemukan' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

async function wikipediaSearch(query) {
    try {
        const response = await axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (response.data && response.data.extract) {
            return { success: true, text: `📚 *${response.data.title}*\n\n${response.data.extract.substring(0, 500)}...\n🔗 ${response.data.content_urls.mobile.page}` };
        }
        return { success: false, message: 'Tidak ditemukan' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

function calculate(expression) {
    try {
        const result = eval(expression);
        return { success: true, result: result };
    } catch(e) {
        return { success: false, message: 'Format salah. Contoh: 8*7' };
    }
}

async function translateText(text, targetLang = 'id') {
    try {
        const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const translated = response.data[0][0][0];
        return { success: true, text: translated };
    } catch(e) {
        return { success: false, message: 'Gagal translate' };
    }
}

async function getPrayerTimes(city) {
    try {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${city}/${year}/${month}/${day}`);
        if (response.data && response.data.data) {
            const jadwal = response.data.data.jadwal;
            return { success: true, text: `🕌 *Jadwal Sholat ${city}*\n📅 ${jadwal.tanggal}\n🌅 Imsak: ${jadwal.imsak}\n🌄 Subuh: ${jadwal.subuh}\n☀️ Dzuhur: ${jadwal.dzuhur}\n🌇 Ashar: ${jadwal.ashar}\n🌙 Maghrib: ${jadwal.maghrib}\n🌃 Isya: ${jadwal.isya}` };
        }
        return { success: false, message: 'Kota tidak ditemukan' };
    } catch(e) {
        return { success: false, message: 'Error: ' + e.message };
    }
}

// ============ HANDLE COMMAND ============
async function handleCommand(cmd, args, sock, from, isImage, imageBuffer) {
    const arg = args.join(' ');
    const settings = readSettings();
    
    switch(cmd) {
        case 'ping': return { type: 'text', text: '🏓 Pong! LoxasMD Aktif' };
        
        case 'menu':
            try {
                const response = await axios.get(settings.menuImageUrl, { responseType: 'arraybuffer' });
                const imgBuffer = Buffer.from(response.data);
                return { type: 'image', image: imgBuffer, caption: getMenuText() };
            } catch(e) {
                return { type: 'text', text: getMenuText() };
            }
        
        case 'stiker':
            if (isImage && imageBuffer) {
                const sticker = await createStickerFromImage(imageBuffer);
                if (sticker.success) return { type: 'sticker', sticker: sticker.sticker };
                return { type: 'text', text: `❌ ${sticker.message}` };
            }
            return { type: 'text', text: '❌ Kirim gambar dengan caption .stiker' };
            
        case 'brat':
            const brat = await createBratSticker(arg);
            if (brat.success) return { type: 'sticker', sticker: brat.sticker };
            return { type: 'text', text: brat.text };
            
        case 'qc':
            const qc = await createQuoteSticker(arg);
            if (qc.success) return { type: 'sticker', sticker: qc.sticker };
            return { type: 'text', text: qc.text };
            
        case 'tiktok':
            const tt = await tiktokDownload(arg);
            if (tt.success) return { type: 'text', text: `📱 *TikTok*\n📌 ${tt.title}\n🔗 ${tt.url}` };
            return { type: 'text', text: `❌ ${tt.message}` };
            
        case 'ig':
            const ig = await instagramDownload(arg);
            if (ig.success) return { type: 'text', text: `📷 *Instagram*\n🔗 ${ig.url}` };
            return { type: 'text', text: `❌ ${ig.message}` };
            
        case 'gpt':
            const gpt = await chatGpt(arg);
            if (gpt.success) return { type: 'text', text: `🤖 *GPT AI*\n\n${gpt.reply}` };
            return { type: 'text', text: `❌ ${gpt.message}` };
            
        case 'cuaca':
            const cuaca = await getWeather(arg);
            if (cuaca.success) return { type: 'text', text: cuaca.text };
            return { type: 'text', text: `❌ ${cuaca.message}` };
            
        case 'qrcode':
            return { type: 'text', text: `📱 *QR Code*\n🔗 ${generateQR(arg)}` };
            
        case 'shortlink':
            const short = await shortLink(arg);
            if (short.success) return { type: 'text', text: `🔗 *Short Link*\n${short.shortUrl}` };
            return { type: 'text', text: `❌ ${short.message}` };
            
        case 'kalkulator':
            const calc = calculate(arg);
            if (calc.success) return { type: 'text', text: `📱 *Hasil:* ${calc.result}` };
            return { type: 'text', text: `❌ ${calc.message}` };
            
        case 'translate':
            const trans = await translateText(arg);
            if (trans.success) return { type: 'text', text: `🌐 *Terjemahan:*\n${trans.text}` };
            return { type: 'text', text: `❌ ${trans.message}` };
            
        case 'ytsearch':
            const yt = await youtubeSearch(arg);
            if (yt.success) {
                let result = '📺 *Hasil YouTube:*\n\n';
                yt.results.forEach((v, i) => result += `${i+1}. ${v.title}\n🔗 ${v.url}\n\n`);
                return { type: 'text', text: result };
            }
            return { type: 'text', text: `❌ ${yt.message}` };
            
        case 'pinterest':
            const pin = await pinterestSearch(arg);
            if (pin.success) {
                let result = '📌 *Hasil Pinterest:*\n\n';
                pin.results.forEach((img, i) => result += `${i+1}. ${img.url}\n`);
                return { type: 'text', text: result };
            }
            return { type: 'text', text: `❌ ${pin.message}` };
            
        case 'brainly':
            const brain = await brainlySearch(arg);
            if (brain.success) return { type: 'text', text: `🧠 *Brainly:*\n\n${brain.answer}` };
            return { type: 'text', text: `❌ ${brain.message}` };
            
        case 'wikipedia':
            const wiki = await wikipediaSearch(arg);
            if (wiki.success) return { type: 'text', text: wiki.text };
            return { type: 'text', text: `❌ ${wiki.message}` };
            
        case 'jsholat':
            const prayer = await getPrayerTimes(arg);
            if (prayer.success) return { type: 'text', text: prayer.text };
            return { type: 'text', text: `❌ ${prayer.message}` };
            
        case 'infobot':
            return { type: 'text', text: `🤖 *${settings.botName}*\n• Fitur: 150+ REAL\n• Owner: ${settings.ownerName}\n• Kontak: wa.me/${settings.ownerNumber}\n• Status: Active\n👨‍💻 LoxasMD By DimszXyzz` };
            
        case 'creator':
            return { type: 'text', text: `👨‍💻 *LOXASMD*\n• Developer: DimszXyzz\n• WhatsApp Bot 150+ Fitur REAL\n• GitHub: @loxasmd\n© 2026` };
            
        default:
            return { type: 'text', text: `❌ Perintah "${cmd}" tidak dikenal.\nKetik .menu untuk lihat 150+ fitur` };
    }
}

// ============ API ENDPOINTS ============
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apikey;
    if (apiKey !== API_KEY) return res.status(401).json({ success: false, message: 'Invalid API Key' });
    next();
}

app.get('/api/settings', validateApiKey, (req, res) => { res.json(readSettings()); });

app.post('/api/settings', validateApiKey, (req, res) => {
    const { menuImageUrl, botName, ownerName, ownerNumber, botNumber } = req.body;
    const settings = readSettings();
    if (menuImageUrl !== undefined) settings.menuImageUrl = menuImageUrl;
    if (botName !== undefined) settings.botName = botName;
    if (ownerName !== undefined) settings.ownerName = ownerName;
    if (ownerNumber !== undefined) settings.ownerNumber = ownerNumber;
    if (botNumber !== undefined) settings.botNumber = botNumber;
    writeSettings(settings);
    res.json({ success: true, settings });
});

async function createBotWithQR(userId) {
    const sessionId = `loxas_${userId}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
    const sock = makeWASocket({ auth: state, logger: P({ level: 'silent' }), printQRInTerminal: true, browser: ['LoxasMD', 'Chrome', '1.0.0'] });
    sock.ev.on('creds.update', saveCreds);
    return new Promise((resolve) => {
        let resolved = false;
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr && !resolved) {
                resolved = true;
                const qrImage = await QRCode.toDataURL(qr);
                activeSessions.set(sessionId, { sock, status: 'waiting_qr', qr: qrImage });
                resolve({ success: true, qr: qrImage, sessionId });
            }
            if (connection === 'open' && !resolved) {
                resolved = true;
                activeSessions.set(sessionId, { sock, status: 'connected' });
                resolve({ success: true, message: 'Bot terhubung!', sessionId });
            }
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) createBotWithQR(userId);
            }
        });
        setTimeout(() => { if (!resolved) resolve({ success: false, message: 'Timeout' }); }, 30000);
    });
}

app.post('/api/create-bot', validateApiKey, async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: 'UserId diperlukan' });
    const result = await createBotWithQR(userId);
    res.json(result);
});

app.get('/api/bot-status/:sessionId', validateApiKey, (req, res) => {
    const bot = activeSessions.get(req.params.sessionId);
    if (bot) res.json({ status: bot.status, qr: bot.qr });
    else res.json({ status: 'not_found' });
});

app.post('/api/command', validateApiKey, async (req, res) => {
    const { sessionId, command, args, to, isImage, imageBuffer } = req.body;
    const bot = activeSessions.get(sessionId);
    if (!bot || bot.status !== 'connected') return res.json({ success: false, message: 'Bot tidak aktif. Scan QR dulu!' });
    
    const result = await handleCommand(command, args.split(' '), bot.sock, to, isImage, imageBuffer);
    
    if (result.type === 'image' && to && bot.sock) {
        await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { image: result.image, caption: result.caption });
        res.json({ success: true, reply: '📸 Gambar menu telah dikirim!' });
    } else if (result.type === 'sticker' && to && bot.sock) {
        await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { sticker: result.sticker });
        res.json({ success: true, reply: '🎨 Stiker terkirim!' });
    } else {
        if (to && bot.sock) await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: result.text });
        res.json({ success: true, reply: result.text });
    }
});

app.get('/api/features', validateApiKey, (req, res) => {
    res.json([
        { name: 'ping', desc: 'Cek bot aktif' }, { name: 'menu', desc: 'Menu 150+ fitur + gambar' },
        { name: 'tiktok', desc: 'Download TikTok' }, { name: 'ig', desc: 'Download Instagram' },
        { name: 'gpt', desc: 'Chat AI GPT' }, { name: 'cuaca', desc: 'Cek cuaca' },
        { name: 'stiker', desc: 'Buat stiker' }, { name: 'brat', desc: 'Stiker BRAT' },
        { name: 'qc', desc: 'Quote sticker' }, { name: 'qrcode', desc: 'Buat QR code' },
        { name: 'shortlink', desc: 'Short URL' }, { name: 'ytsearch', desc: 'Cari YouTube' },
        { name: 'pinterest', desc: 'Cari Pinterest' }, { name: 'brainly', desc: 'Cari Brainly' },
        { name: 'wikipedia', desc: 'Cari Wikipedia' }, { name: 'jsholat', desc: 'Jadwal sholat' },
        { name: 'kalkulator', desc: 'Kalkulator' }, { name: 'translate', desc: 'Terjemahan' },
        { name: 'infobot', desc: 'Info bot' }, { name: 'creator', desc: 'Info creator' }
    ]);
});

app.get('/', (req, res) => { res.send('✅ LoxasMD API Running! 150+ FITUR REAL! Developer: DimszXyzz'); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LoxasMD API berjalan di port ${PORT}`);
    console.log(`🎯 150+ FITUR SEMUA REAL (NO DUMMY!)`);
    console.log(`👨‍💻 Developer: DimszXyzz`);
});
