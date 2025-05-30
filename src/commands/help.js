module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles',
    usage: '!help',
    aliases: ['aide', 'commands'],
    
    async execute(message, args, client) {
      // Récupérer le gestionnaire de commandes depuis le bot
      const commandHandler = message.client?.commandHandler || 
                            client.bot?.commandHandler;
      
      if (!commandHandler) {
        await message.reply('Impossible de récupérer la liste des commandes.');
        return;
      }
      
      const commands = commandHandler.getCommands();
      
      let helpText = 'Commandes disponibles:\n\n';
      
      commands.forEach(command => {
        helpText += `${command.usage}\n`;
        helpText += `└ ${command.description}\n`;
        
        if (command.aliases && command.aliases.length > 0) {
          helpText += `└ Alias: ${command.aliases.join(', ')}\n`;
        }
        
        helpText += '\n';
      });
      
      helpText += 'Tapez une commande pour l\'utiliser !';
      
      await message.reply(helpText);
    }
  };