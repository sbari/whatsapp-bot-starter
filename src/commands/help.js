// commands/help.js
module.exports = {
  name: 'help',
  description: 'Affiche la liste des commandes disponibles',
  usage: '!help',
  aliases: ['aide', 'commands'],
  
  async execute(message, args, client) {
    try {
      // Accès direct au commandHandler via le client
      const commandHandler = client.commandHandler;
      
      if (!commandHandler) {
        await message.reply('❌ Gestionnaire de commandes non disponible.');
        return;
      }
      
      const commands = commandHandler.getCommands();
      
      if (!commands || commands.length === 0) {
        await message.reply('❌ Aucune commande disponible.');
        return;
      }
      
      let helpText = '📋 **Commandes disponibles:**\n\n';
      
      commands.forEach(command => {
        helpText += `**${command.usage}**\n`;
        helpText += `└ ${command.description}\n`;
        
        if (command.aliases && command.aliases.length > 0) {
          helpText += `└ *Alias: ${command.aliases.join(', ')}*\n`;
        }
        
        helpText += '\n';
      });
      
      helpText += '💡 *Tapez une commande pour l\'utiliser !*';
      
      await message.reply(helpText);
      
    } catch (error) {
      console.error('Erreur dans help:', error);
      await message.reply('❌ Erreur lors de l\'affichage des commandes.');
    }
  }
};