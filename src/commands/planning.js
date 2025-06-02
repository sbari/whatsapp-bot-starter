const CalendarService = require('../services/CalendarService');

module.exports = {
  name: 'planning',
  description: 'Affiche le planning des événements à venir',
  usage: '!planning [nombre_jours]',
  aliases: ['agenda', 'calendrier'],
  
  async execute(message, args, client) {
    try {
      const config = require('../../config.json');
      const calendarService = new CalendarService(config);
      
      if (!calendarService.isEnabled()) {
        await message.reply('❌ Service Google Calendar non disponible.\nVérifiez la configuration.');
        return;
      }

      // Nombre de jours à afficher (par défaut 7)
      let days = 7;
      if (args.length > 0) {
        const inputDays = parseInt(args[0]);
        if (!isNaN(inputDays) && inputDays > 0 && inputDays <= 30) {
          days = inputDays;
        } else {
          await message.reply('❌ Nombre de jours invalide (1-30 jours maximum).');
          return;
        }
      }

      const loadingMessage = await message.reply('📅 Récupération du planning...');

      try {
        // Calculer les dates
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days);
        endDate.setHours(23, 59, 59, 999);

        // Récupérer les événements
        const events = await calendarService.findEvents({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        if (events.length === 0) {
          await loadingMessage.edit(
            `📅 **Planning vide**\n\n` +
            `Aucun événement prévu pour les ${days} prochains jours.`
          );
          return;
        }

        // Grouper les événements par jour
        const eventsByDay = this.groupEventsByDay(events);
        
        // Construire le message
        let planningMessage = `📅 **Planning des ${days} prochains jours**\n`;
        planningMessage += `*(${events.length} événement${events.length > 1 ? 's' : ''})*\n\n`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < days; i++) {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() + i);
          
          const dateKey = currentDate.toISOString().split('T')[0];
          const dayEvents = eventsByDay[dateKey] || [];
          
          // En-tête du jour
          const dayName = this.getDayName(currentDate, i);
          const dateStr = currentDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
          });
          
          planningMessage += `**${dayName} ${dateStr}**\n`;
          
          if (dayEvents.length === 0) {
            planningMessage += '   _Aucun événement_\n\n';
          } else {
            dayEvents.forEach(event => {
              const startTime = new Date(event.start.dateTime || event.start.date);
              const endTime = new Date(event.end.dateTime || event.end.date);
              
              const timeStr = `${startTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${endTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`;
              
              planningMessage += `   🕐 ${timeStr} | ${event.summary}\n`;
            });
            planningMessage += '\n';
          }
        }

        // Ajouter les commandes utiles
        planningMessage += `**Commandes utiles:**\n`;
        planningMessage += `• !event-add "titre" date heure_début heure_fin\n`;
        planningMessage += `• !event-remove "titre" [date]\n`;
        planningMessage += `• !planning [jours]`;

        await loadingMessage.edit(planningMessage);

      } catch (error) {
        await loadingMessage.edit(`❌ Erreur lors de la récupération: ${error.message}`);
      }

    } catch (error) {
      console.error('Erreur dans planning:', error);
      await message.reply('❌ Une erreur inattendue est survenue.');
    }
  },

  /**
   * Group events by day
   */
  groupEventsByDay(events) {
    const grouped = {};
    
    events.forEach(event => {
      const startDate = new Date(event.start.dateTime || event.start.date);
      const dateKey = startDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(event);
    });
    
    // Trier les événements de chaque jour par heure
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.start.dateTime || a.start.date);
        const timeB = new Date(b.start.dateTime || b.start.date);
        return timeA - timeB;
      });
    });
    
    return grouped;
  },

  /**
   * Get day name with relative indicators
   */
  getDayName(date, dayIndex) {
    const dayNames = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 
      'Jeudi', 'Vendredi', 'Samedi'
    ];
    
    const dayName = dayNames[date.getDay()];
    
    if (dayIndex === 0) return `${dayName} (Aujourd'hui)`;
    if (dayIndex === 1) return `${dayName} (Demain)`;
    
    return dayName;
  },

  /**
   * Validate command arguments
   */
  validate(args, message) {
    if (args.length > 1) {
      return {
        valid: false,
        error: 'Trop d\'arguments. Usage: !planning [nombre_jours]'
      };
    }
    
    if (args.length === 1) {
      const days = parseInt(args[0]);
      if (isNaN(days) || days < 1 || days > 30) {
        return {
          valid: false,
          error: 'Le nombre de jours doit être entre 1 et 30'
        };
      }
    }
    
    return { valid: true };
  }
};