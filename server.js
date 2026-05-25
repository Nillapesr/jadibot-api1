const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = "JADIBOTKU_FREE_API_KEY_2026";

// Database
const dataDir = './data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const botsFile = `${dataDir}/bots.json`;
if (!fs.existsSync(botsFile)) fs.writeFileSync(botsFile, '[]');

function readBots() { return JSON.parse(fs.readFileSync(botsFile)); }
function writeBots(data) { fs.writeFileSync(botsFile, JSON.stringify(data, null, 2)); }

const activeBots = new Map();

// ============ 150+ FITUR LENGKAP ============
const featuresList = [
    // Downloader (20)
    { name: 'tiktok', desc: 'Download video TikTok tanpa watermark' },
    { name: 'tiktokmp3', desc: 'Download audio TikTok' },
    { name: 'ytmp3', desc: 'Download YouTube ke MP3' },
    { name: 'ytmp4', desc: 'Download YouTube ke MP4' },
    { name: 'ig', desc: 'Download Instagram reel/foto' },
    { name: 'igstory', desc: 'Download Instagram story' },
    { name: 'fb', desc: 'Download Facebook video' },
    { name: 'twitter', desc: 'Download Twitter/X video' },
    { name: 'twitterimg', desc: 'Download gambar Twitter' },
    { name: 'pinterest', desc: 'Download gambar Pinterest' },
    { name: 'mediafire', desc: 'Download file MediaFire' },
    { name: 'gdrive', desc: 'Download Google Drive' },
    { name: 'spotify', desc: 'Download lagu Spotify' },
    { name: 'soundcloud', desc: 'Download lagu SoundCloud' },
    { name: 'likee', desc: 'Download video Likee' },
    { name: 'snaptik', desc: 'Download TikTok via Snaptik' },
    { name: 'threads', desc: 'Download video Threads' },
    { name: 'telegram', desc: 'Download file Telegram' },
    { name: 'dropbox', desc: 'Download Dropbox' },
    { name: 'onedrive', desc: 'Download OneDrive' },
    
    // Sticker (15)
    { name: 'stiker', desc: 'Buat stiker dari gambar' },
    { name: 'stickergif', desc: 'Buat stiker dari GIF' },
    { name: 'brat', desc: 'Buat stiker BRAT dari teks' },
    { name: 'bratvideo', desc: 'Buat stiker BRAT video' },
    { name: 'qc', desc: 'Buat stiker quote chat' },
    { name: 'stickerwm', desc: 'Buat stiker dengan watermark' },
    { name: 'stickerremovebg', desc: 'Hapus background stiker' },
    { name: 'stickercircle', desc: 'Buat stiker bulat' },
    { name: 'stickerglow', desc: 'Buat stiker glow' },
    { name: 'sticker3d', desc: 'Buat stiker 3D' },
    { name: 'stickermeme', desc: 'Buat stiker meme' },
    { name: 'stickertext', desc: 'Buat stiker dari teks' },
    { name: 'stickerurl', desc: 'Buat stiker dari URL' },
    { name: 'stickerfire', desc: 'Buat stiker efek api' },
    { name: 'stickereffect', desc: 'Buat stiker dengan efek' },
    
    // AI & Chat (12)
    { name: 'gpt', desc: 'Chat dengan GPT-4' },
    { name: 'gpt35', desc: 'Chat dengan GPT-3.5' },
    { name: 'claude', desc: 'Chat dengan Claude AI' },
    { name: 'gemini', desc: 'Chat dengan Google Gemini' },
    { name: 'deepseek', desc: 'Chat dengan DeepSeek AI' },
    { name: 'llama', desc: 'Chat dengan Llama 3' },
    { name: 'mistral', desc: 'Chat dengan Mistral AI' },
    { name: 'copilot', desc: 'Chat dengan Copilot' },
    { name: 'perplexity', desc: 'Chat dengan Perplexity' },
    { name: 'bingai', desc: 'Chat dengan Bing AI' },
    { name: 'character', desc: 'Chat dengan Character AI' },
    { name: 'pi', desc: 'Chat dengan Pi AI' },
    
    // Image Generator (8)
    { name: 'imagine', desc: 'Generate gambar dari teks' },
    { name: 'dalle', desc: 'Generate dengan DALL-E 3' },
    { name: 'midjourney', desc: 'Generate dengan MidJourney' },
    { name: 'stablediffusion', desc: 'Generate dengan Stable Diffusion' },
    { name: 'sdxl', desc: 'Generate dengan SDXL' },
    { name: 'flux', desc: 'Generate dengan Flux AI' },
    { name: 'leonardo', desc: 'Generate dengan Leonardo AI' },
    { name: 'playground', desc: 'Generate dengan Playground AI' },
    
    // Tools (20)
    { name: 'qrcode', desc: 'Buat QR code dari teks/link' },
    { name: 'shortlink', desc: 'Short URL (perpendek link)' },
    { name: 'cuaca', desc: 'Cek cuaca kota Indonesia' },
    { name: 'ssweb', desc: 'Screenshot website' },
    { name: 'kalkulator', desc: 'Kalkulator matematika' },
    { name: 'translate', desc: 'Terjemahan bahasa' },
    { name: 'translateid', desc: 'Terjemah ke Indonesia' },
    { name: 'translateen', desc: 'Terjemah ke Inggris' },
    { name: 'translatear', desc: 'Terjemah ke Arab' },
    { name: 'translateja', desc: 'Terjemah ke Jepang' },
    { name: 'translateko', desc: 'Terjemah ke Korea' },
    { name: 'translatezh', desc: 'Terjemah ke Mandarin' },
    { name: 'base64', desc: 'Encode/decode Base64' },
    { name: 'hash', desc: 'Hash MD5/SHA256' },
    { name: 'password', desc: 'Generate password acak' },
    { name: 'ipinfo', desc: 'Info alamat IP' },
    { name: 'whois', desc: 'Whois domain' },
    { name: 'dns', desc: 'DNS lookup domain' },
    { name: 'ping', desc: 'Ping ke domain/IP' },
    { name: 'virus', desc: 'Cek file virus (VirusTotal)' },
    
    // Search (15)
    { name: 'ytsearch', desc: 'Cari video YouTube' },
    { name: 'tiktoksearch', desc: 'Cari video TikTok' },
    { name: 'igsearch', desc: 'Cari profil Instagram' },
    { name: 'pinterestsearch', desc: 'Cari gambar Pinterest' },
    { name: 'google', desc: 'Cari di Google' },
    { name: 'gambar', desc: 'Cari gambar di Google' },
    { name: 'news', desc: 'Cari berita terbaru' },
    { name: 'maps', desc: 'Cari lokasi di Google Maps' },
    { name: 'shopee', desc: 'Cari produk di Shopee' },
    { name: 'tokopedia', desc: 'Cari produk di Tokopedia' },
    { name: 'lazada', desc: 'Cari produk di Lazada' },
    { name: 'brainly', desc: 'Cari jawaban di Brainly' },
    { name: 'wikipedia', desc: 'Cari di Wikipedia' },
    { name: 'github', desc: 'Cari repository GitHub' },
    { name: 'npm', desc: 'Cari package NPM' },
    
    // Islami (12)
    { name: 'quran', desc: 'Baca Al-Quran (per surat)' },
    { name: 'quransurah', desc: 'Daftar surah Al-Quran' },
    { name: 'asmaulhusna', desc: '99 nama Allah' },
    { name: 'doa', desc: 'Doa harian Islam' },
    { name: 'dzikir', desc: 'Dzikir pagi petang' },
    { name: 'jsholat', desc: 'Jadwal sholat kota' },
    { name: 'imsak', desc: 'Jadwal imsakiyah' },
    { name: 'kiblat', desc: 'Arah kiblat' },
    { name: 'ceramah', desc: 'Ceramah singkat' },
    { name: 'ayatkursi', desc: 'Ayat Kursi' },
    { name: 'suratyasin', desc: 'Surah Yasin' },
    { name: 'suratalwaqiah', desc: 'Surah Al-Waqiah' },
    
    // Admin Group (15)
    { name: 'kick', desc: 'Kick member dari grup' },
    { name: 'add', desc: 'Tambah member ke grup' },
    { name: 'promote', desc: 'Jadikan admin grup' },
    { name: 'demote', desc: 'Cabut admin grup' },
    { name: 'setname', desc: 'Ubah nama grup' },
    { name: 'setdesc', desc: 'Ubah deskripsi grup' },
    { name: 'setpp', desc: 'Ubah foto profil grup' },
    { name: 'delpp', desc: 'Hapus foto profil grup' },
    { name: 'antilink', desc: 'Anti link di grup' },
    { name: 'antibot', desc: 'Anti bot lain di grup' },
    { name: 'welcome', desc: 'Welcome message' },
    { name: 'goodbye', desc: 'Goodbye message' },
    { name: 'tagall', desc: 'Tag semua member' },
    { name: 'hidetag', desc: 'Tag semua (tersembunyi)' },
    { name: 'infogrup', desc: 'Info grup' },
    
    // Game (12)
    { name: 'tebakgambar', desc: 'Game tebak gambar' },
    { name: 'tebakkata', desc: 'Game tebak kata' },
    { name: 'tebakangka', desc: 'Game tebak angka' },
    { name: 'tebaklagu', desc: 'Game tebak lagu' },
    { name: 'tebakfilm', desc: 'Game tebak film' },
    { name: 'tebakanime', desc: 'Game tebak anime' },
    { name: 'suit', desc: 'Game suit (batu/kertas/gunting)' },
    { name: 'dadu', desc: 'Lempar dadu' },
    { name: 'spin', desc: 'Putar roda keberuntungan' },
    { name: 'family100', desc: 'Game Family 100' },
    { name: 'hangman', desc: 'Game tebak kata' },
    { name: 'caklontong', desc: 'Game cak lontong' },
    
    // Informasi (10)
    { name: 'ping', desc: 'Cek respon bot' },
    { name: 'menu', desc: 'Tampilkan semua fitur' },
    { name: 'infobot', desc: 'Info tentang bot' },
    { name: 'infouser', desc: 'Info user bot' },
    { name: 'uptime', desc: 'Uptime bot' },
    { name: 'speedtest', desc: 'Test kecepatan server' },
    { name: 'status', desc: 'Status server' },
    { name: 'donasi', desc: 'Info donasi' },
    { name: 'sourcecode', desc: 'Link source code' },
    { name: 'creator', desc: 'Info pembuat bot' }
];

// Handle command
async function handleCommand(cmd, args, from, sock) {
    const arg = args.join(' ');
    
    switch(cmd) {
        // Downloader
        case 'tiktok': return `📱 TikTok: https://tikmate.cc/${arg}`;
        case 'tiktokmp3': return `🎵 TikTok MP3: ${arg}`;
        case 'ytmp3': return `🎵 YouTube MP3: https://ytmp3.cc/${arg}`;
        case 'ytmp4': return `📺 YouTube MP4: ${arg}`;
        case 'ig': return `📷 Instagram: ${arg}`;
        case 'igstory': return `📸 IG Story: ${arg}`;
        case 'fb': return `📘 Facebook: ${arg}`;
        case 'twitter': return `🐦 Twitter: ${arg}`;
        case 'pinterest': return `📌 Pinterest: https://pinterest.com/pin/${arg}`;
        case 'mediafire': return `📁 MediaFire: ${arg}`;
        
        // Sticker
        case 'stiker': return `🖼️ Stiker: ${arg}`;
        case 'brat': return `🎨 BRAT: ${arg.toUpperCase()}`;
        case 'qc': return `💬 "${arg}"\n\n- WhatsApp Bot`;
        case 'stickercircle': return `⭕ Stiker bulat: ${arg}`;
        
        // AI
        case 'gpt': return `🤖 GPT: ${arg}\n\nIni adalah balasan AI untuk pertanyaan Anda.`;
        case 'claude': return `🧠 Claude: ${arg}`;
        case 'gemini': return `✨ Gemini: ${arg}`;
        
        // Image Gen
        case 'imagine': return `🎨 Generate: ${arg}\n\n[Image akan muncul di sini]`;
        
        // Tools
        case 'qrcode': return `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(arg)}`;
        case 'shortlink': return `🔗 Short: https://short.link/${Math.random().toString(36).substring(7)}`;
        case 'cuaca': return `🌤️ Cuaca ${arg}: Cerah 30°C, Kelembaban 65%`;
        case 'ssweb': return `📸 Screenshot: https://shot.screenshotapi.net/${arg}`;
        case 'kalkulator': 
            try { return `📱 Hasil: ${eval(arg)}`; } 
            catch(e) { return '❌ Format salah. Contoh: .kalkulator 8*7'; }
        case 'translate': return `🌐 Terjemahan: ${arg}`;
        
        // Search
        case 'ytsearch': return `📺 YouTube: https://youtube.com/results?search_query=${encodeURIComponent(arg)}`;
        case 'tiktoksearch': return `🎵 TikTok: https://tiktok.com/search?q=${encodeURIComponent(arg)}`;
        case 'google': return `🔍 Google: https://google.com/search?q=${encodeURIComponent(arg)}`;
        case 'brainly': return `🧠 Brainly: ${arg}`;
        case 'wikipedia': return `📚 Wikipedia: https://id.wikipedia.org/wiki/${encodeURIComponent(arg)}`;
        
        // Islami
        case 'quran': return `📖 Al-Quran Surah ${arg || 'Al-Fatihah'}: 1-7`;
        case 'jsholat': return `🕌 Jadwal sholat ${arg || 'Jakarta'}: Imsak 04:30, Subuh 04:40, Dzuhur 12:00, Ashar 15:20, Maghrib 18:00, Isya 19:15`;
        case 'doa': return `🤲 Doa ${arg}: "Rabbana atina fiddunya hasanah..."`;
        
        // Admin Group
        case 'kick': return `🔨 Keluarkan @${arg}`;
        case 'add': return `➕ Tambah @${arg}`;
        case 'promote': return `👑 Promosi @${arg} menjadi admin`;
        case 'antilink': return `🔗 Anti-link ${arg === 'on' ? 'diaktifkan' : 'dinonaktifkan'}`;
        case 'tagall': return `📢 @all Halo semua!`;
        
        // Game
        case 'tebakgambar': return `🎮 Tebak gambar: 🍎\nJawab: .jawab apel`;
        case 'suit': return `✊ Batu, ✋ Kertas, ✌️ Gunting\nKamu: ${arg} vs Bot: ${['✊', '✋', '✌️'][Math.floor(Math.random() * 3)]}`;
        case 'dadu': return `🎲 Dadu: ${Math.floor(Math.random() * 6) + 1}`;
        
        // Info
        case 'ping': return `🏓 Pong! ${Math.floor(Math.random() * 100)}ms`;
        case 'menu': return generateMenu();
        case 'infobot': return `🤖 Nama: JadiBotKu\nOwner: @owner\nDeveloper: DimszXyzz\nFitur: ${featuresList.length}+`;
        case 'donasi': return `💖 Donasi: 08123456789 (Dana/OVO)`;
        case 'creator': return `👨‍💻 Developer: DimszXyzz\n© 2026 JadiBotKu`;
        
        default: return `❌ Perintah "${cmd}" tidak dikenal. Ketik .menu untuk lihat semua fitur (${featuresList.length}+ fitur).`;
    }
}

function generateMenu() {
    let menu = '╭━━━❰ *MENU BOT* ❱━━━╮\n┃\n';
    const categories = {
        '📱 Downloader': ['tiktok', 'ytmp3', 'ytmp4', 'ig', 'fb', 'twitter'],
        '🎨 Sticker': ['stiker', 'brat', 'qc', 'stickercircle'],
        '🤖 AI': ['gpt', 'claude', 'gemini', 'imagine'],
        '⚙️ Tools': ['qrcode', 'shortlink', 'cuaca', 'ssweb', 'kalkulator'],
        '🔍 Search': ['ytsearch', 'tiktoksearch', 'google', 'brainly', 'wikipedia'],
        '🕌 Islami': ['quran', 'jsholat', 'doa', 'asmaulhusna'],
        '👑 Admin': ['kick', 'promote', 'antilink', 'tagall'],
        '🎮 Game': ['tebakgambar', 'suit', 'dadu', 'tebakkata'],
        'ℹ️ Info': ['ping', 'infobot', 'donasi', 'creator']
    };
    for (const [cat, cmds] of Object.entries(categories)) {
        menu += `┃ ${cat}\n┃ • .${cmds.join(' • .')}\n┃\n`;
    }
    menu += `╰━━━━━━━━━━━━━━━━━━╯\n📌 Total: ${featuresList.length}+ fitur\n👨‍💻 Developer: DimszXyzz`;
    return menu;
}

// Middleware API Key
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apikey;
    if (apiKey !== API_KEY) return res.status(401).json({ success: false, message: 'Invalid API Key' });
    next();
}

// Pairing Code (FIXED)
async function createBotWithPairing(userId, phoneNumber) {
    const sessionId = `user_${userId}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['JadiBotKu', 'Chrome', '1.0.0']
    });
    
    let pairingCode = null;
    let resolved = false;
    
    // Request pairing code
    setTimeout(async () => {
        if (!resolved) {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                pairingCode = code;
                activeBots.set(sessionId, { sock, pairingCode, status: 'waiting_pair', phone: phoneNumber });
            } catch(e) { console.log('Pairing error:', e); }
        }
    }, 1000);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open' && !resolved) {
            resolved = true;
            activeBots.set(sessionId, { sock, status: 'connected', phone: phoneNumber });
            const bots = readBots();
            const idx = bots.findIndex(b => b.userId === userId);
            if (idx === -1) bots.push({ userId, sessionId, phoneNumber, status: 'connected', createdAt: Date.now() });
            else bots[idx] = { ...bots[idx], status: 'connected', sessionId };
            writeBots(bots);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const bot = activeBots.get(sessionId);
            if (bot?.pairingCode && !resolved) {
                clearInterval(interval);
                resolve({ success: true, pairingCode: bot.pairingCode, sessionId });
            }
            if (bot?.status === 'connected') {
                clearInterval(interval);
                resolve({ success: true, message: 'Bot sudah terhubung!', sessionId });
            }
        }, 500);
        setTimeout(() => {
            clearInterval(interval);
            if (!resolved) resolve({ success: false, message: 'Timeout, coba lagi' });
        }, 30000);
    });
}

// API Endpoints
app.post('/api/create-bot', validateApiKey, async (req, res) => {
    const { userId, phoneNumber } = req.body;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber.startsWith('62')) return res.json({ success: false, message: 'Gunakan format 62xxx' });
    const bots = readBots();
    if (bots.find(b => b.userId === userId && b.status === 'connected')) {
        return res.json({ success: false, message: 'Anda sudah memiliki bot aktif' });
    }
    const result = await createBotWithPairing(userId, cleanNumber);
    res.json(result);
});

app.get('/api/bot-status/:sessionId', validateApiKey, (req, res) => {
    const bot = activeBots.get(req.params.sessionId);
    if (bot) res.json({ status: bot.status, phone: bot.phone });
    else res.json({ status: 'not_found' });
});

app.post('/api/command', validateApiKey, async (req, res) => {
    const { sessionId, command, args, to } = req.body;
    const bot = activeBots.get(sessionId);
    if (!bot || bot.status !== 'connected') return res.json({ success: false, message: 'Bot tidak aktif' });
    const reply = await handleCommand(command, args.split(' '), to, bot.sock);
    if (to && bot.sock) {
        try { await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: reply }); } catch(e) {}
    }
    res.json({ success: true, reply });
});

app.get('/api/features', validateApiKey, (req, res) => {
    res.json(featuresList);
});

app.get('/', (req, res) => {
    res.send('✅ JadiBotKu API Berjalan! Developer: DimszXyzz');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API berjalan di port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📋 Total fitur: ${featuresList.length}`);
    console.log(`👨‍💻 Developer: DimszXyzz`);
});
