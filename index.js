const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');

// 1. Initialize Gemini API (Replace with your actual API key from Google AI Studio)
const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6JNPEDW6HRXTV-y9qq3fv8U1DrCCmeFiW8D90IyYuTi1w' });

// 2. Initialize WhatsApp client (LocalAuth saves your session so you only scan QR once)
const client = new Client({
    authStrategy: new LocalAuth()
});

// 3. Display QR Code in your terminal
client.on('qr', (qr) => {
    console.log('\n--- SCAN THIS QR CODE WITH YOUR WHATSAPP ---');
    qrcode.generate(qr, { small: true });
});

// 4. Log when connection is successful
client.on('ready', () => {
    console.log('✅ WhatsApp Gemini Bot is online and ready!');
});

// 5. Handle incoming messages
client.on('message', async (message) => {
    // Ignore group chats and status updates
    if (message.from.endsWith('@g.us') || message.isStatus) return;

    // Ignore your own sent messages
    if (message.fromMe) return;

    try {
        console.log(`\n📩 Incoming from ${message.from}: "${message.body}"`);

        // System prompt guiding Gemini's language and persona
        const systemInstruction = `
        You are an AI personal assistant replying on Allan's WhatsApp account.
        Automatically detect whether the incoming text is written in English, Kiswahili, or Sheng.
        Reply warmly, naturally, and concisely in the exact same language used by the sender.
        Keep replies conversational and friendly, matching standard text message length.
        `;

        // Generate response using Gemini 2.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: message.body,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const replyText = response.text;

        // Send reply back to the chat
        await message.reply(replyText);
        console.log(`📤 Replied: "${replyText}"`);

    } catch (error) {
        console.error('❌ Error generating AI response:', error);
    }
});

// 6. Start the bot
client.initialize();