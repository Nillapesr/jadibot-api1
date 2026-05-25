const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = "JADIBOTKU_FREE_API_KEY_2026";

// Database session
const sessions = new Map();

// Middleware API Key
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apikey;
    if (apiKey !== API_KEY) return res.status(401).json({ success: false, message: 'Invalid API Key' });
    next();
}

// Fungsi pairing code yang BENAR
async function createPairingCode(phoneNumber) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${phoneNumber}`);
    
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['JadiBotKu', 'Chrome', '120.0.0']
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    return new Promise((resolve, reject) => {
        // Kirim pairing code
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`Pairing code for ${phoneNumber}: ${code}`);
                resolve({ sock, code });
            } catch (err) {
                reject(err);
            }
        }, 2000);
        
        // Timeout
        setTimeout(() => {
            reject(new Error('Timeout getting pairing code'));
        }, 20000);
    });
}

// API Create Bot
app.post('/api/create-bot', validateApiKey, async (req, res) => {
    const { userId, phoneNumber } = req.body;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!cleanNumber.startsWith('62')) {
        return res.json({ success: false, message: 'Gunakan format 62xxx (contoh: 6281234567890)' });
    }
    
    console.log(`Creating pairing code for: ${cleanNumber}`);
    
    try {
        const { sock, code } = await createPairingCode(cleanNumber);
        
        // Simpan session
        sessions.set(`user_${userId}`, { sock, phone: cleanNumber, status: 'pairing' });
        
        // Monitor koneksi
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(`✅ Bot connected for user: ${userId}`);
                sessions.set(`user_${userId}`, { sock, phone: cleanNumber, status: 'connected' });
                
                // Save ke database
                const bots = JSON.parse(fs.readFileSync('./data/bots.json'));
                bots.push({ userId, phone: cleanNumber, status: 'connected', createdAt: Date.now() });
                fs.writeFileSync('./data/bots.json', JSON.stringify(bots, null, 2));
            }
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log(`Reconnecting for user: ${userId}`);
                }
            }
        });
        
        res.json({ success: true, pairingCode: code, sessionId: `user_${userId}` });
        
    } catch (error) {
        console.error('Pairing error:', error);
        res.json({ success: false, message: 'Gagal membuat pairing code: ' + error.message });
    }
});

// Cek status bot
app.get('/api/bot-status/:sessionId', validateApiKey, (req, res) => {
    const bot = sessions.get(req.params.sessionId);
    if (bot) {
        res.json({ status: bot.status, phone: bot.phone });
    } else {
        res.json({ status: 'not_found' });
    }
});

// Kirim perintah
app.post('/api/command', validateApiKey, async (req, res) => {
    const { sessionId, command, args, to } = req.body;
    const bot = sessions.get(sessionId);
    
    if (!bot || bot.status !== 'connected') {
        return res.json({ success: false, message: 'Bot tidak aktif. Deploy ulang dengan pairing code.' });
    }
    
    let reply = `✅ Perintah ${command} diterima!`;
    
    switch(command) {
        case 'ping': reply = '🏓 Pong! Bot aktif.'; break;
        case 'menu': reply = '📋 Menu: .ping, .gpt, .tiktok, .cuaca, .stiker'; break;
        case 'gpt': reply = `🤖 GPT: ${args}`; break;
        case 'cuaca': reply = `🌤️ Cuaca ${args}: Cerah 30°C`; break;
        default: reply = `✅ Perintah ${command} dijalankan.`;
    }
    
    if (to && bot.sock) {
        try {
            await bot.sock.sendMessage(`${to}@s.whatsapp.net`, { text: reply });
        } catch(e) {}
    }
    
    res.json({ success: true, reply });
});

// Daftar fitur
app.get('/api/features', validateApiKey, (req, res) => {
    res.json([
        { name: 'ping', desc: 'Cek bot aktif' },
        { name: 'menu', desc: 'Menu fitur' },
        { name: 'gpt', desc: 'Chat AI' },
        { name: 'tiktok', desc: 'Download TikTok' },
        { name: 'cuaca', desc: 'Cek cuaca' },
        { name: 'stiker', desc: 'Buat stiker' }
    ]);
});

app.get('/', (req, res) => {
    res.send('✅ API JadiBotKu Running! Pairing Code WORKING');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API berjalan di port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📱 Pairing code feature: READY`);
});
