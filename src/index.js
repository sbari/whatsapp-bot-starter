const WhatsAppBot = require('./bot');

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\nArrêt du bot...');
  if (bot) {
    await bot.stop();
  }
  process.exit(0);
});

// Démarrage du bot
const bot = new WhatsAppBot();

console.log('Démarrage du bot WhatsApp...');
bot.start().catch(error => {
  console.error('Erreur lors du démarrage:', error);
  process.exit(1);
});