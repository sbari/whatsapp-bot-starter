// bot.js 
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
    // IMPORTANT: Exposer commandHandler pour que les commandes puissent y accéder
    this.client.commandHandler = this.commandHandler;
    
    // QR Code pour l'authentification
    this.client.on('qr', (qr) => {
      console.log('Scannez ce QR code avec WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Bot prêt
    this.client.on('ready', () => {
      console.log('✅ Bot WhatsApp connecté et prêt !');
      console.log(`🔧 Préfixe des commandes: ${config.prefix}`);
      console.log(`📋 ${this.commandHandler.commands.size} commandes chargées`);
    });

    // Gestion des messages
    this.client.on('message', async (message) => {
      try {
        // Ignorer les messages du bot lui-même
        if (message.fromMe) return;

        // Debug: afficher les messages reçus
        console.log(`📨 Message reçu: ${message.body}`);

        // Traiter les commandes
        if (message.body.startsWith(config.prefix)) {
          console.log(`⚡ Commande détectée: ${message.body}`);
          await this.commandHandler.handle(message, this.client);
        }
      } catch (error) {
        console.error('❌ Erreur lors du traitement du message:', error);
      }
    });

    // Gestion des erreurs
    this.client.on('disconnected', (reason) => {
      console.log('❌ Bot déconnecté:', reason);
    });

    // Ajout de logs pour le debug
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Échec de l\'authentification:', msg);
    });

    this.client.on('authenticated', () => {
      console.log('✅ Authentification réussie');
    });
  }

  async start() {
    try {
      console.log('🚀 Démarrage du bot...');
      await this.client.initialize();
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
    }
  }

  async stop() {
    console.log('🛑 Arrêt du bot...');
    await this.client.destroy();
  }
}

module.exports = WhatsAppBot;