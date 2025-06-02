# WhatsApp Bot Starter

A simple and extensible WhatsApp bot with Google Calendar integration.

## Features

- ✅ **Core Commands**: hello, ping, help, status
- 🌤️ **Weather**: OpenWeatherMap integration
- 📅 **Google Calendar**: Add, remove and display events
- 🔧 **Extensible**: Easily add your own commands

## Installation

```bash
git clone https://github.com/your-username/whatsapp-bot-starter.git
cd whatsapp-bot-starter
npm install
```

## Configuration

### 1. Basic Setup

```bash
cp config.example.json config.json
```

Edit `config.json` with your settings.

### 2. Weather (Optional)

1. Create an account on [OpenWeatherMap](https://openweathermap.org/)
2. Get your API key
3. Add it to `config.json`:

```json
{
  "openWeatherApiKey": "your_api_key"
}
```

### 3. Google Calendar (Optional)

#### A. Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Enable the Google Calendar API:
   - APIs & Services → Library → Google Calendar API → Enable
4. Create a service account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Download the JSON file
   - Rename it to `service-account.json` and place it in the root directory

#### B. Configure Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. Create a new calendar or use an existing one
3. Settings → Share with specific people
4. Add the service account email (found in the JSON file)
5. Give "Make changes to events" permissions
6. Copy the calendar ID (Settings → Integrate calendar)

#### C. Update Configuration

```json
{
  "googleCalendar": {
    "enabled": true,
    "calendarId": "your_calendar_id@group.calendar.google.com",
    "serviceAccountFile": "service-account.json",
    "timeZone": "Europe/Paris"
  }
}
```

## Usage

### Starting the Bot

```bash
npm start
```

Scan the QR code with WhatsApp.

### Available Commands

#### Core Commands
- `!hello [name]` - Greet the user
- `!ping` - Test connectivity
- `!help` - List commands
- `!status` - Bot status (admin only)

#### Weather
- `!weather Paris` - Current weather

#### Google Calendar
- `!event-add "Title" 25/12/2024 2pm 4pm` - Add an event
- `!event-add "Meeting" monday 9am 12pm Description` - With weekday
- `!event-remove "Title"` - Remove an event
- `!event-remove "Title" 25/12/2024` - Remove with specific date
- `!planning` - Show next 7 days
- `!planning 14` - Show next 14 days

### Usage Examples

```
!event-add "Team Meeting" 15/01/2025 2pm 4pm Weekly team sync
✅ Event added successfully!

!planning
📅 Planning for the next 7 days
🕐 14:00 - 16:00 | Team Meeting

!event-remove "Team Meeting"
✅ Event removed successfully!
```

## Adding a New Command

1. Create a file in `src/commands/`:

```javascript
// src/commands/time.js
module.exports = {
  name: 'time',
  description: 'Display current time',
  usage: '!time',
  aliases: ['clock'],
  
  async execute(message, args, client) {
    const now = new Date().toLocaleString('en-US');
    await message.reply(`Current time: ${now}`);
  }
};
```

2. Add the command to `config.json`:

```json
{
  "enabledCommands": ["hello", "help", "ping", "time"]
}
```

3. Restart the bot

## Project Structure

```
whatsapp-bot-starter/
├── src/
│   ├── commands/           # Bot commands
│   │   ├── hello.js
│   │   ├── help.js
│   │   ├── ping.js
│   │   ├── status.js
│   │   ├── weather.js
│   │   ├── event-add.js
│   │   ├── event-remove.js
│   │   ├── planning.js
│   │   └── index.js        # Command handler
│   ├── services/           # External services
│   │   └── calendarService.js
│   ├── bot.js              # Main bot
│   └── index.js           # Entry point
├── config.example.json    # Example configuration
├── package.json
└── README.md
```

## Dependencies

- `whatsapp-web.js` - WhatsApp interface
- `qrcode-terminal` - QR code display
- `axios` - HTTP requests (weather)
- `googleapis` - Google Calendar API

## Date and Time Formats

### Supported Date Formats
- `DD/MM/YYYY` - 25/12/2024
- `DD/MM` - 25/12 (current year)
- Weekdays - monday, tuesday, wednesday, etc.

### Supported Time Formats
- `HHam/pm` - 2pm, 9am
- `HH:MM` - 14:30, 09:15
- `HHhMM` - 14h30, 9h15
- `HHh` - 14h, 9h

## Security

⚠️ **Important:**
- Never commit `config.json` or `service-account.json`
- These files contain sensitive data
- Use `.example` versions to share structure

## Troubleshooting

### WhatsApp Connection Issues
- Make sure you're using a supported Node.js version (16+)
- Clear session data if authentication fails
- Check that Chromium/Chrome is properly installed

### Google Calendar Issues
- Verify service account email has calendar access
- Check that the calendar ID is correct
- Ensure Google Calendar API is enabled in Cloud Console

### Weather API Issues
- Confirm OpenWeatherMap API key is valid
- New API keys can take up to 2 hours to activate
- Check API usage limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- [GitHub Issues](https://github.com/your-username/whatsapp-bot-starter/issues)
- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Google Calendar API Documentation](https://developers.google.com/calendar)

## License

MIT