// commands/weather.js - VERSION CORRIGÉE AVEC SUPPORT DE TOUTE CASSE
const axios = require('axios');

module.exports = {
  name: 'weather',
  description: 'Affiche la météo pour une ville donnée',
  usage: '!weather [ville]',
  aliases: ['meteo', 'temps'],
  
  async execute(message, args, client) {
    try {
      // Vérifier qu'une ville est fournie
      if (args.length === 0) {
        await message.reply(
          '🌤️ **Usage de la commande météo:**\n\n' +
          '`!weather [ville]`\n\n' +
          '**Exemples:**\n' +
          '• `!weather Paris`\n' +
          '• `!weather NEW YORK`\n' +
          '• `!weather toKyo`\n' +
          '• `!weather saint-étienne`\n\n' +
          '💡 *La casse n\'a pas d\'importance !*'
        );
        return;
      }
      
      // Joindre tous les arguments pour former le nom de la ville
      // et normaliser la casse (première lettre de chaque mot en majuscule)
      const cityInput = args.join(' ');
      const city = this.normalizeCity(cityInput);
      
      const config = require('../../config.json');
      
      // Vérifier que la clé API est configurée
      if (!config.openWeatherApiKey || config.openWeatherApiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        await message.reply(
          '❌ **Clé API OpenWeatherMap non configurée.**\n\n' +
          '🔧 Veuillez ajouter votre clé API dans `config.json`:\n' +
          '```json\n' +
          '"openWeatherApiKey": "votre_clé_ici"\n' +
          '```\n\n' +
          '🌐 Obtenez votre clé gratuite sur: https://openweathermap.org/api'
        );
        return;
      }
      
      // Envoyer un message de chargement
      const loadingMessage = await message.reply(`🌤️ Récupération de la météo pour **${city}**...`);
      
      // Faire la requête à l'API OpenWeatherMap
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather`;
      
      console.log(`🌍 Requête météo pour: ${city}`);
      
      const response = await axios.get(apiUrl, {
        params: {
          q: cityInput, // Utiliser l'input original pour l'API
          appid: config.openWeatherApiKey,
          units: 'metric', // Celsius
          lang: 'fr' // Français
        },
        timeout: 15000 // 15 secondes de timeout
      });
      
      const weather = response.data;
      console.log(`✅ Météo récupérée pour: ${weather.name}, ${weather.sys.country}`);
      
      // Formatage de la réponse
      const weatherMessage = this.formatWeatherMessage(weather);
      
      // Envoyer la météo (whatsapp-web.js ne supporte pas edit())
      await message.reply(weatherMessage);
      console.log(`📤 Météo envoyée pour ${weather.name}`);
      
    } catch (error) {
      console.error('❌ Erreur météo:', error);
      
      let errorMessage = '❌ **Erreur lors de la récupération de la météo.**\n\n';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 
              '❌ **Ville non trouvée.**\n\n' +
              '🔍 Vérifiez l\'orthographe ou essayez:\n' +
              '• Le nom en anglais (ex: `!weather London`)\n' +
              '• Avec le pays (ex: `!weather Paris, FR`)\n' +
              '• Une ville plus connue à proximité';
            break;
          case 401:
            errorMessage = 
              '❌ **Clé API invalide ou expirée.**\n\n' +
              '🔑 Vérifiez votre clé API OpenWeatherMap dans `config.json`';
            break;
          case 429:
            errorMessage = 
              '❌ **Limite d\'appels API atteinte.**\n\n' +
              '⏰ Réessayez dans quelques minutes';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 
              '❌ **Service météo temporairement indisponible.**\n\n' +
              '🔄 Réessayez dans quelques instants';
            break;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 
          '❌ **Timeout - Le service météo met trop de temps à répondre.**\n\n' +
          '🔄 Réessayez avec une connexion plus stable';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 
          '❌ **Problème de connexion internet.**\n\n' +
          '🌐 Vérifiez votre connexion et réessayez';
      }
      
      await message.reply(errorMessage);
    }
  },
  
  /**
   * Normalise le nom de la ville (première lettre de chaque mot en majuscule)
   */
  normalizeCity(cityInput) {
    return cityInput
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  },
  
  /**
   * Formatage du message météo avec emojis et mise en forme
   */
  formatWeatherMessage(weather) {
    const { 
      name, 
      sys, 
      main, 
      weather: conditions, 
      wind, 
      visibility,
      dt
    } = weather;
    
    // Emojis météo basés sur les codes OpenWeatherMap
    const weatherEmojis = {
      // Codes principaux
      '01d': '☀️', '01n': '🌙', // clear sky
      '02d': '🌤️', '02n': '🌙', // few clouds
      '03d': '⛅', '03n': '☁️', // scattered clouds
      '04d': '☁️', '04n': '☁️', // broken clouds
      '09d': '🌦️', '09n': '🌧️', // shower rain
      '10d': '🌦️', '10n': '🌧️', // rain
      '11d': '⛈️', '11n': '⛈️', // thunderstorm
      '13d': '🌨️', '13n': '🌨️', // snow
      '50d': '🌫️', '50n': '🌫️', // mist/fog
    };
    
    const condition = conditions[0];
    const emoji = weatherEmojis[condition.icon] || '🌤️';
    
    // Température avec couleur basée sur la valeur
    const temp = Math.round(main.temp);
    let tempEmoji = '🌡️';
    if (temp <= 0) tempEmoji = '🥶';
    else if (temp <= 10) tempEmoji = '🧊';
    else if (temp <= 20) tempEmoji = '😊';
    else if (temp <= 30) tempEmoji = '🌡️';
    else tempEmoji = '🥵';
    
    // Construction du message
    let message = `${emoji} **Météo à ${name}, ${sys.country}**\n\n`;
    
    // Température principale
    message += `${tempEmoji} **Température:** ${temp}°C\n`;
    message += `└ *Ressentie:* ${Math.round(main.feels_like)}°C\n`;
    message += `└ *Min/Max:* ${Math.round(main.temp_min)}°C / ${Math.round(main.temp_max)}°C\n\n`;
    
    // Conditions
    message += `☁️ **Conditions:** ${condition.description.charAt(0).toUpperCase() + condition.description.slice(1)}\n\n`;
    
    // Détails atmosphériques
    message += `💧 **Humidité:** ${main.humidity}%\n`;
    message += `📊 **Pression:** ${main.pressure} hPa\n`;
    
    // Vent
    if (wind) {
      message += `💨 **Vent:** ${Math.round(wind.speed * 3.6)} km/h`; // m/s vers km/h
      
      if (wind.deg !== undefined) {
        const direction = this.getWindDirection(wind.deg);
        message += ` (${direction})`;
      }
      message += '\n';
    }
    
    // Visibilité
    if (visibility) {
      const visibilityKm = Math.round(visibility / 1000);
      message += `👁️ **Visibilité:** ${visibilityKm} km\n`;
    }
    
    // Heure de mise à jour
    const updateTime = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      day: '2-digit',
      month: '2-digit', 
      hour: '2-digit',
      minute: '2-digit'
    });
    message += `\n🕐 *Mis à jour: ${updateTime}*`;
    
    return message;
  },
  
  /**
   * Convertir les degrés en direction du vent
   */
  getWindDirection(degrees) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE', 
      'S', 'SSO', 'SO', 'OSO',
      'O', 'ONO', 'NO', 'NNO'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  },

  /**
   * Validation des arguments
   */
  validate(args, message) {
    if (args.length === 0) {
      return {
        valid: false,
        error: 'Veuillez spécifier une ville'
      };
    }
    
    // Vérifier que ce ne sont pas que des espaces
    const cityName = args.join(' ').trim();
    if (cityName.length === 0) {
      return {
        valid: false,
        error: 'Le nom de ville ne peut pas être vide'
      };
    }
    
    return { valid: true };
  }
};