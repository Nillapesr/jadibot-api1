
const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const QRCode = require('qrcode');
const axios = require('axios');

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
        ownerNumber: '6282342265016'
    }, null, 2));
}

function readSettings() { return JSON.parse(fs.readFileSync(settingsFile)); }
function writeSettings(data) { fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2)); }

const activeSessions = new Map();

// MENU
function getMenuText() {
    return `╔═══════════════════════════════════════════╗
║        🔥 LOXASMD BOT 🔥                    ║
║    WhatsApp Bot 150+ Fitur                  ║
║      👨‍💻 By DimszXyzz 👨‍💻                  ║
╠═══════════════════════════════════════════╣
║ 📱 .tiktok .ig .fb .ytmp3 .ytmp4          ║
║ 🎨 .stiker .brat .qc                      ║
║ 🤖 .gpt .claude .gemini                   ║
║ ⚙️ .qrcode .cuaca .kalkulator             ║
║ 🔍 .ytsearch .pinterest .brainly          ║
║ 🕌 .jsholat .quran .doa                   ║
║ 👑 .kick .promote .antilink               ║
║ 🎮 .tebakgambar .suit .dadu               ║
║ ℹ️ .ping .menu .infobot .creator          ║
╚═══════════════════════════════════════════╝
📌 TOTAL 150+ FITUR | ⚡ KETIK .ping`;
}

// HANDLE COMMAND
async function handleCommand(cmd, args, sock, to) {
    const arg = args.join(' ');
    const settings = readSettings();
    
    switch(cmd) {
        case 'ping': return { type: 'text', text: '🏓 Pong! LoxasMD Aktif' };
        
        case 'menu':
            try {
                const res = await axios.get(settings.menuImageUrl, { responseType: 'arraybuffer' });
                return { type: 'image', image: Buffer.from(res.data), caption: getMenuText() };
            } catch(e) {
                return { type: 'text', text: getMenuText() };
            }
        
        case 'gpt':
            try {
                const res = await axios.get(`https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(arg)}`);
                return { type: 'text', text: `🤖 ${res.data.answer || 'AI sibuk'}` };
            } catch(e) { return { type: 'text', text: '❌ Error AI' }; }
        
        case 'cuaca':
            try {
                const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${arg}&appid=b6907d289e10d714a6e88b30761fae22&units=metric`);
                const w = res.data;
                return { type: 'text', text: `🌤️ ${arg}: ${w.weather[0].description}, ${w.main.temp}°C, 💧${w.main.humidity}%` };
            } catch(e) { return { type: 'text', text: '❌ Kota tidak ditemukan' }; }
        
        case 'qrcode':
            return { type: 'text', text: `📱 QR: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arg)}` };
        
        case 'kalkulator':
            try { return { type: 'text', text: `📱 Hasil: ${eval(arg)}` }; }
            catch(e) { return { type: 'text', text: '❌ Contoh: 8*7' }; }
        
        case 'ytsearch':
            try {
                const res = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(arg)}&filter=videos`);
                if (res.data?.items) {
                    let txt = '📺 YouTube:\n';
                    res.data.items.slice(0, 3).forEach((v, i) => {
                        txt += `${i+1}. ${v.title}\nhttps://youtube.com/watch?v=${v.url.split('=')[1]}\n`;
                    });
                    return { type: 'text', text: txt };
                }
                return { type: 'text', text: '❌ Tidak ditemukan' };
            } catch(e) { return { type: 'text', text: '❌ Error' }; }
        
        case 'infobot':
            return { type: 'text', text: `🤖 ${settings.botName}\n👑 ${settings.ownerName}\n📱 wa.me/${settings.ownerNumber}\n👨‍💻 DimszXyzz` };
        
        case 'creator':
            return { type: 'text', text: `👨‍💻 LoxasMD By DimszXyzz\nWA Bot 150+ Fitur\n© 2026` };
        
        default:
            return { type: 'text', text: `❌ Ketik .menu untuk 150+ fitur` };
    }
}

// ============ API ENDPOINTS ============
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apikey;
    if (apiKey !== API_KEY) return res.status(401).json({ error: 'Invalid API Key' });
    next();
}

app.get('/api/settings', validateApiKey, (req, res) => { res.json(readSettings()); });

app.post('/api/settings', validateApiKey, (req, res) => {
    const { menuImageUrl, botName, ownerName, ownerNumber } = req.body;
    const s = readSettings();
    if (menuImageUrl !== undefined) s.menuImageUrl = menuImageUrl;
    if (botName !== undefined) s.botName = botName;
    if (ownerName !== undefined) s.ownerName = ownerName;
    if (ownerNumber !== undefined) s.ownerNumber = ownerNumber;
    writeSettings(s);
    res.json({ success: true, settings: s });
});

app.post('/api/create-bot', validateApiKey, async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: 'UserId diperlukan' });
    
    const sessionId = `loxas_${userId}`;
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
            activeSessions.set(sessionId, { sock, status: 'waiting', qr: qrImage });
            res.json({ success: true, qr: qrImage, sessionId });
        }
        if (connection === 'open') {
            activeSessions.set(sessionId, { sock, status: 'connected' });
        }
    });
    
    setTimeout(() => {
        if (!qrSent) res.json({ success: false, message: 'Timeout' });
    }, 30000);
});

app.get('/api/bot-status/:sessionId', validateApiKey, (req, res) => {
    const bot = activeSessions.get(req.params.sessionId);
    res.json({ status: bot?.status || 'not_found', qr: bot?.qr });
});

app.post('/api/command', validateApiKey, async (req, res) => {
    const { sessionId, command, args, to } = req.body;
    const bot = activeSessions.get(sessionId);
    
    if (!bot || bot.status !== 'connected') {
        return res.json({ success: false, message: 'Bot tidak aktif. Scan QR dulu!' });
    }
    
    const result = await handleCommand(command, args.split(' '), bot.sock, to);
    
    if (result.type === 'image' && to && bot.sock) {
        await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { image: result.image, caption: result.caption });
        res.json({ success: true, reply: '📸 Menu terkirim!' });
    } else {
        if (to && bot.sock) await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: result.text });
        res.json({ success: true, reply: result.text });
    }
});

app.get('/api/features', validateApiKey, (req, res) => {
    res.json([
        { name: 'ping', desc: 'Cek bot aktif' },
        { name: 'menu', desc: 'Menu 150+ fitur' },
        { name: 'gpt', desc: 'Chat AI' },
        { name: 'cuaca', desc: 'Cek cuaca' },
        { name: 'qrcode', desc: 'Buat QR code' },
        { name: 'kalkulator', desc: 'Kalkulator' },
        { name: 'ytsearch', desc: 'Cari YouTube' },
        { name: 'infobot', desc: 'Info bot' },
        { name: 'creator', desc: 'Info creator' }
    ]);
});

app.get('/', (req, res) => { res.send('✅ LoxasMD API Running! DimszXyzz'); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LoxasMD API running on port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
});
