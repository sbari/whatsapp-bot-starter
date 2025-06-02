const EventEmitter = require('events');

class BotEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  setupListeners() {
    this.on('command:executed', (data) => {
      console.log(`✅ Command ${data.command} executed by ${data.user}`);
    });

    this.on('error:occurred', (error) => {
      console.error(`❌ Error: ${error.message}`);
    });
  }
}

module.exports = new BotEventEmitter();