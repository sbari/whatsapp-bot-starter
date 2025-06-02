const os = require('os');

module.exports = {
  name: 'status',
  description: 'Affiche l\'état du bot, uptime, CPU et mémoire',
  usage: '!status',
  aliases: ['info', 'stats'],
  adminOnly: true, // Réservé aux admins
  
  async execute(message, args, client) {
    try {
      // Informations sur le processus
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      
      // Informations système
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const cpus = os.cpus();
      
      // Formatage de l'uptime
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        let result = '';
        if (days > 0) result += `${days}j `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        result += `${secs}s`;
        
        return result;
      };
      
      // Formatage des bytes
      const formatBytes = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
      };
      
      // Calcul du pourcentage de CPU (approximatif)
      const getCpuUsage = () => {
        const cpuUsage = process.cpuUsage();
        const totalUsage = cpuUsage.user + cpuUsage.system;
        return Math.round((totalUsage / 1000000) * 100) / 100; // Convertir en pourcentage
      };
      
      // Construction du message de statut
      let statusMessage = `**Status du Bot**\n\n`;
      
      // Informations générales
      statusMessage += `**Général:**\n`;
      statusMessage += `• Statut: 🟢 En ligne\n`;
      statusMessage += `• Uptime: ${formatUptime(uptime)}\n`;
      statusMessage += `• Node.js: ${process.version}\n`;
      statusMessage += `• Plateforme: ${os.platform()} ${os.arch()}\n\n`;
      
      // Mémoire du processus
      statusMessage += `**Mémoire (Bot):**\n`;
      statusMessage += `• RSS: ${formatBytes(memUsage.rss)}\n`;
      statusMessage += `• Heap utilisée: ${formatBytes(memUsage.heapUsed)}\n`;
      statusMessage += `• Heap totale: ${formatBytes(memUsage.heapTotal)}\n\n`;
      
      // Mémoire système
      const memPercentage = Math.round((usedMem / totalMem) * 100);
      statusMessage += `**Mémoire (Système):**\n`;
      statusMessage += `• Utilisée: ${formatBytes(usedMem)} (${memPercentage}%)\n`;
      statusMessage += `• Libre: ${formatBytes(freeMem)}\n`;
      statusMessage += `• Totale: ${formatBytes(totalMem)}\n\n`;
      
      // CPU
      statusMessage += `**Processeur:**\n`;
      statusMessage += `• Modèle: ${cpus[0].model.substring(0, 30)}...\n`;
      statusMessage += `• Coeurs: ${cpus.length}\n`;
      statusMessage += `• Architecture: ${os.arch()}\n\n`;
      
      // Charge système
      const loadAvg = os.loadavg();
      statusMessage += `**Charge système:**\n`;
      statusMessage += `• 1 min: ${loadAvg[0].toFixed(2)}\n`;
      statusMessage += `• 5 min: ${loadAvg[1].toFixed(2)}\n`;
      statusMessage += `• 15 min: ${loadAvg[2].toFixed(2)}\n\n`;
      
      // Informations WhatsApp (si disponibles)
      try {
        const info = client.info;
        if (info) {
          statusMessage += `**WhatsApp:**\n`;
          statusMessage += `• Connecté en tant que: ${info.pushname || 'N/A'}\n`;
          statusMessage += `• Numéro: ${info.wid.user}\n`;
          statusMessage += `• Version WA: ${info.phone?.wa_version || 'N/A'}\n`;
        }
      } catch (e) {
        statusMessage += `**WhatsApp:** Informations non disponibles\n`;
      }
      
      await message.reply(statusMessage);
      
    } catch (error) {
      console.error('Erreur dans la commande status:', error);
      await message.reply('Erreur lors de la récupération du statut.');
    }
  }
};