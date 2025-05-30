const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor(config) {
    this.config = config;
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    const commandFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'index.js');

    for (const file of commandFiles) {
      const command = require(path.join(__dirname, file));
      
      // Vérifier si la commande est activée
      if (this.config.enabledCommands.includes(command.name)) {
        this.commands.set(command.name, command);
        
        // Ajouter les alias s'ils existent
        if (command.aliases) {
          command.aliases.forEach(alias => {
            this.commands.set(alias, command);
          });
        }
      }
    }

    console.log(`${this.commands.size} commandes chargées`);
  }

  async handle(message, client) {
    try {
      // Extraire la commande et les arguments
      const args = message.body.slice(this.config.prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Trouver la commande
      const command = this.commands.get(commandName);
      
      if (!command) {
        await message.reply('Commande inconnue. Tapez !help pour voir la liste des commandes.');
        return;
      }

      // Vérifier les permissions si nécessaire
      if (command.adminOnly) {
        const contact = await message.getContact();
        const userNumber = contact.number || contact.id.user;
        
        if (!this.config.adminNumbers.includes(userNumber)) {
          await message.reply('Vous n\'avez pas les permissions pour cette commande.');
          return;
        }
      }

      // Exécuter la commande
      console.log(`Exécution de la commande: ${commandName}`);
      await command.execute(message, args, client);

    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande:', error);
      await message.reply('Une erreur est survenue lors de l\'exécution de la commande.');
    }
  }

  getCommands() {
    return Array.from(this.commands.values())
      .filter((cmd, index, arr) => arr.findIndex(c => c.name === cmd.name) === index);
  }
}

module.exports = CommandHandler;