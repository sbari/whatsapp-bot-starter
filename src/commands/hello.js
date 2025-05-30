module.exports = {
    name: 'hello',
    description: 'Salue l\'utilisateur',
    usage: '!hello [nom]',
    aliases: ['salut', 'hi'],
    
    async execute(message, args, client) {
      const contact = await message.getContact();
      const userName = contact.pushname || contact.name || 'inconnu';
      
      let response;
      
      if (args.length > 0) {
        const targetName = args.join(' ');
        response = `Salut ${targetName} ! Message envoyé par ${userName}`;
      } else {
        response = `Salut ${userName} ! Comment ça va ?`;
      }
      
      await message.reply(response);
    }
  };