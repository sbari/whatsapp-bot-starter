const CalendarService = require('../services/CalendarService');
module.exports = {
  name: 'event-remove',
  description: 'Supprime un événement du calendrier Google',
  usage: '!event-remove <titre> [date]',
  aliases: ['remove-event', 'absent'],
  
  async execute(message, args, client) {
    try {
      const config = require('../../config.json');
      const calendarService = new CalendarService(config);
      
      if (!calendarService.isEnabled()) {
        await message.reply('❌ Service Google Calendar non disponible.\nVérifiez la configuration.');
        return;
      }

      // Validation des arguments
      if (args.length < 1) {
        await message.reply(
          '❌ Arguments insuffisants.\n\n' +
          '**Usage:**\n' +
          '!event-remove <titre> [date]\n\n' +
          '**Exemples:**\n' +
          '• !event-remove "Réunion équipe"\n' +
          '• !event-remove "Formation" 25/12/2024\n' +
          '• !event-remove "Rendez-vous" lundi'
        );
        return;
      }

      const title = args[0].replace(/['"]/g, '');
      const dateStr = args[1];
      
      const loadingMessage = await message.reply('🔍 Recherche de l\'événement...');

      try {
        // Définir la plage de recherche
        let startDate, endDate;
        
        if (dateStr) {
          // Date spécifique fournie
          try {
            const parsed = calendarService.parseDateTime(dateStr, '00:00');
            const searchDate = new Date(parsed.date);
            
            startDate = new Date(searchDate);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(searchDate);
            endDate.setHours(23, 59, 59, 999);
          } catch (error) {
            await loadingMessage.edit(`❌ Format de date invalide: ${error.message}`);
            return;
          }
        } else {
          // Rechercher dans la semaine à venir si pas de date spécifiée
          startDate = new Date();
          endDate = new Date();
          endDate.setDate(startDate.getDate() + 7);
        }

        // Rechercher les événements
        const events = await calendarService.findEvents({
          summary: title,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        if (events.length === 0) {
          await loadingMessage.edit(
            `❌ Aucun événement trouvé avec le titre "${title}"` +
            (dateStr ? ` pour la date ${dateStr}` : ' dans les 7 prochains jours')
          );
          return;
        }

        if (events.length === 1) {
          // Un seul événement trouvé, le supprimer directement
          const event = events[0];
          
          try {
            await calendarService.removeEvent(event.id);
            
            const contact = await message.getContact();
            const userName = contact.pushname || contact.name || 'Utilisateur';
            
            let confirmMessage = `✅ **Événement supprimé avec succès !**\n\n`;
            confirmMessage += `👤 **Supprimé par:** ${userName}\n`;
            confirmMessage += calendarService.formatEvent(event);

            await loadingMessage.edit(confirmMessage);
            
            console.log(`🗑️ Événement supprimé: ${event.summary} par ${userName}`);
            
          } catch (error) {
            await loadingMessage.edit(`❌ Erreur lors de la suppression: ${error.message}`);
          }
          
        } else {
          // Plusieurs événements trouvés, demander précision
          let listMessage = `🔍 **${events.length} événements trouvés :**\n\n`;
          
          events.forEach((event, index) => {
            listMessage += `**${index + 1}.** ${calendarService.formatEvent(event)}\n\n`;
          });
          
          listMessage += '❓ Veuillez préciser la date pour identifier l\'événement à supprimer.\n';
          listMessage += '**Exemple:** !event-remove "' + title + '" 25/12/2024';

          await loadingMessage.edit(listMessage);
        }

      } catch (error) {
        await loadingMessage.edit(`❌ Erreur lors de la recherche: ${error.message}`);
      }

    } catch (error) {
      console.error('Erreur dans event-remove:', error);
      await message.reply('❌ Une erreur inattendue est survenue.');
    }
  },

  /**
   * Validate command arguments
   */
  validate(args, message) {
    if (args.length < 1) {
      return {
        valid: false,
        error: 'Le titre de l\'événement est requis'
      };
    }
    
    return { valid: true };
  }
};