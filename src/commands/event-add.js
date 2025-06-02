const CalendarService = require('../services/CalendarService');
module.exports = {
  name: 'event-add',
  description: 'Ajoute un événement au calendrier Google',
  usage: '!event-add <titre> <date> <heure_début> <heure_fin> [description]',
  aliases: ['add-event', 'present'],
  
  async execute(message, args, client) {
    try {
      const config = require('../../config.json');
      const calendarService = new CalendarService(config);
      
      if (!calendarService.isEnabled()) {
        await message.reply('❌ Service Google Calendar non disponible.\nVérifiez la configuration.');
        return;
      }

      // Validation des arguments
      if (args.length < 4) {
        await message.reply(
          '❌ Arguments insuffisants.\n\n' +
          '**Usage:**\n' +
          '!event-add <titre> <date> <heure_début> <heure_fin> [description]\n\n' +
          '**Exemples:**\n' +
          '• !event-add "Réunion équipe" 25/12/2024 14h 16h\n' +
          '• !event-add "Formation" lundi 9h 12h Description optionnelle\n' +
          '• !event-add "Rendez-vous" 15/01 10:30 11:30'
        );
        return;
      }

      // Parser les arguments
      const title = args[0].replace(/['"]/g, ''); // Enlever les guillemets
      const dateStr = args[1];
      const startTimeStr = args[2];
      const endTimeStr = args[3];
      const description = args.slice(4).join(' ') || '';

      // Validation et parsing des dates/heures
      let parsedStart, parsedEnd;
      
      try {
        parsedStart = calendarService.parseDateTime(dateStr, startTimeStr);
        parsedEnd = calendarService.parseDateTime(dateStr, endTimeStr);
      } catch (error) {
        await message.reply(`❌ Format de date/heure invalide: ${error.message}\n\n` +
          '**Formats acceptés:**\n' +
          '• Date: DD/MM/YYYY, DD/MM, lundi, mardi, etc.\n' +
          '• Heure: HHh, HH:MM, HHhMM');
        return;
      }

      // Validation logique
      if (parsedStart.time >= parsedEnd.time) {
        await message.reply('❌ L\'heure de fin doit être après l\'heure de début.');
        return;
      }

      // Créer l'événement
      const eventData = {
        summary: title,
        date: parsedStart.date,
        startTime: parsedStart.time,
        endTime: parsedEnd.time,
        description: description
      };

      const loadingMessage = await message.reply('📅 Ajout de l\'événement en cours...');

      try {
        const result = await calendarService.addEvent(eventData);
        
        // Message de confirmation
        const contact = await message.getContact();
        const userName = contact.pushname || contact.name || 'Utilisateur';
        
        let confirmMessage = `✅ **Événement ajouté avec succès !**\n\n`;
        confirmMessage += `👤 **Créé par:** ${userName}\n`;
        confirmMessage += `📝 **Titre:** ${title}\n`;
        confirmMessage += `📅 **Date:** ${parsedStart.date}\n`;
        confirmMessage += `🕐 **Horaires:** ${parsedStart.time} - ${parsedEnd.time}\n`;
        
        if (description) {
          confirmMessage += `📄 **Description:** ${description}\n`;
        }
        
        confirmMessage += `\n🔗 [Voir dans Google Calendar](${result.htmlLink})`;

        await loadingMessage.edit(confirmMessage);
        
        console.log(`📅 Événement créé: ${title} par ${userName}`);
        
      } catch (error) {
        await loadingMessage.edit(`❌ Erreur lors de la création: ${error.message}`);
      }

    } catch (error) {
      console.error('Erreur dans event-add:', error);
      await message.reply('❌ Une erreur inattendue est survenue.');
    }
  },

  /**
   * Validate command arguments
   */
  validate(args, message) {
    if (args.length < 4) {
      return {
        valid: false,
        error: 'Minimum 4 arguments requis: titre, date, heure_début, heure_fin'
      };
    }
    
    return { valid: true };
  }
};