const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.AQ.Ab8RN6JNPEDW6HRXTV-y9qq3fv8U1DrCCmeFiW8D90IyYuTi1w });

// Initialize WhatsApp Client with Railway Chrome paths & flags
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Generate QR code for WhatsApp login
client.on('qr', (qr) => {
    console.log('QR RECEIVED, scan please:');
    qrcode.generate(qr, { small: true });
});

// Confirm when the bot is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// Handle incoming messages
client.on('message', async (message) => {
    // Ignore status broadcasts or messages from the bot itself
    if (message.from === 'status@broadcast' || message.fromMe) return;

    try {
        console.log(`Received message from ${message.from}: ${message.body}`);

        // Call Gemini 2.5 Flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message.body,
        });

        const replyText = response.text;
        
        // Send the AI response back to WhatsApp
        await message.reply(replyText);
        console.log(`Replied: ${replyText}`);
        
    } catch (error) {
        console.error('Error generating AI response:', error);
        await message.reply('Sorry, I encountered an error processing your request.');
    }
});

// Start the client
client.initialize();