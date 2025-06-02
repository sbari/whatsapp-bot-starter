class Analytics {
    constructor() {
      this.stats = {
        commandsExecuted: 0,
        errors: 0,
        uptime: Date.now()
      };
    }
  
    trackCommand(commandName) {
      this.stats.commandsExecuted++;
      console.log(`📊 Command executed: ${commandName}`);
    }
  
    trackError(error) {
      this.stats.errors++;
      console.error(`❌ Error tracked:`, error.message);
    }
  
    getStats() {
      return {
        ...this.stats,
        uptime: Date.now() - this.stats.uptime
      };
    }
  }
  
  module.exports = new Analytics();