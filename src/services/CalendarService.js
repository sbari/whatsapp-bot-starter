const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class CalendarService {
  constructor(config) {
    this.config = config.googleCalendar;
    this.calendar = null;
    this.auth = null;
    
    if (this.config.enabled) {
      this.initializeAuth();
    }
  }

  /**
   * Initialize Google Calendar authentication
   */
  initializeAuth() {
    try {
      const serviceAccountPath = path.join(process.cwd(), this.config.serviceAccountFile);
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found: ${serviceAccountPath}`);
      }

      this.auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Calendar service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar:', error.message);
      this.config.enabled = false;
    }
  }

  /**
   * Check if calendar service is available
   */
  isEnabled() {
    return this.config.enabled && this.calendar;
  }

  /**
   * Add event to calendar
   */
  async addEvent(eventData) {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar service not available');
    }

    try {
      const event = {
        summary: eventData.summary,
        start: {
          dateTime: `${eventData.date}T${eventData.startTime}:00`,
          timeZone: this.config.timeZone
        },
        end: {
          dateTime: `${eventData.date}T${eventData.endTime}:00`,
          timeZone: this.config.timeZone
        },
        description: eventData.description || ''
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Error adding event:', error);
      throw new Error(`Failed to add event: ${error.message}`);
    }
  }

  /**
   * Remove event from calendar
   */
  async removeEvent(eventId) {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar service not available');
    }

    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing event:', error);
      throw new Error(`Failed to remove event: ${error.message}`);
    }
  }

  /**
   * Find events by criteria
   */
  async findEvents(criteria) {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar service not available');
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: criteria.startDate,
        timeMax: criteria.endDate,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
      });

      let events = response.data.items || [];

      // Filter by summary if specified
      if (criteria.summary) {
        events = events.filter(event => 
          event.summary && 
          event.summary.toLowerCase().includes(criteria.summary.toLowerCase())
        );
      }

      return events;
    } catch (error) {
      console.error('Error finding events:', error);
      throw new Error(`Failed to find events: ${error.message}`);
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(maxResults = 10) {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar service not available');
    }

    try {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + 7);

      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: now.toISOString(),
        timeMax: endOfWeek.toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw new Error(`Failed to get upcoming events: ${error.message}`);
    }
  }

  /**
   * Parse date and time from user input
   */
  parseDateTime(dateStr, timeStr) {
    try {
      // Parse date (format: DD/MM/YYYY or DD/MM)
      let date;
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 2) {
          // Add current year if not specified
          const currentYear = new Date().getFullYear();
          date = new Date(currentYear, parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } else {
        // Handle weekday names
        date = this.getNextWeekdayDate(dateStr);
      }

      if (!date || isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }

      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      // Parse time (format: HHh or HH:MM or HHhMM)
      const formattedTime = this.parseTime(timeStr);

      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      throw new Error(`Invalid date/time format: ${error.message}`);
    }
  }

  /**
   * Parse time string to HH:MM format
   */
  parseTime(timeStr) {
    const time = timeStr.toLowerCase().replace(/[h:]/g, ':');
    
    if (time.match(/^\d{1,2}:\d{2}$/)) {
      return time.padStart(5, '0');
    } else if (time.match(/^\d{1,2}:$/)) {
      return time.replace(':', ':00').padStart(5, '0');
    } else if (time.match(/^\d{1,2}$/)) {
      return `${time.padStart(2, '0')}:00`;
    }
    
    throw new Error('Invalid time format');
  }

  /**
   * Get next date for a weekday
   */
  getNextWeekdayDate(dayName) {
    const daysOfWeek = {
      'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
      'vendredi': 5, 'samedi': 6, 'dimanche': 0
    };

    const targetDay = daysOfWeek[dayName.toLowerCase()];
    if (targetDay === undefined) {
      throw new Error('Invalid weekday name');
    }

    const today = new Date();
    const currentDay = today.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    
    return nextDate;
  }

  /**
   * Format event for display
   */
  formatEvent(event) {
    const startTime = new Date(event.start.dateTime || event.start.date);
    const endTime = new Date(event.end.dateTime || event.end.date);
    
    const dateStr = startTime.toLocaleDateString('fr-FR');
    const startTimeStr = startTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTimeStr = endTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `📅 **${event.summary}**\n🕐 ${dateStr} de ${startTimeStr} à ${endTimeStr}`;
  }
}

module.exports = CalendarService;