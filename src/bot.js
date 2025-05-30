const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const CommandHandler = require('./commands');
const config = require('../config.json');

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'simple-bot'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    
    this.commandHandler = new CommandHandler(config);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // QR Code pour l'authentification
    this.client.on('qr', (qr) => {
      console.log('Scannez ce QR code avec WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Bot prêt
    this.client.on('ready', () => {
      console.log('Bot WhatsApp connecté et prêt !');
      console.log(`Préfixe des commandes: ${config.prefix}`);
    });

    // Gestion des messages
    this.client.on('message', async (message) => {
      // Ignorer les messages du bot lui-même
      if (message.fromMe) return;

      // Traiter les commandes
      if (message.body.startsWith(config.prefix)) {
        await this.commandHandler.handle(message, this.client);
      }
    });

    // Gestion des erreurs
    this.client.on('disconnected', (reason) => {
      console.log('Bot déconnecté:', reason);
    });
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
    }
  }

  async stop() {
    await this.client.destroy();
  }
}

module.exports = WhatsAppBot;