module.exports = {
    name: 'ping',
    description: 'Test la connectivité du bot',
    usage: '!ping',
    aliases: ['test'],
    
    async execute(message, args, client) {
      const startTime = Date.now();
      
      const sentMessage = await message.reply('Pong !');
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const response = `Pong !\nLatence: ${latency}ms\nUptime: ${hours}h ${minutes}m ${seconds}s`;
      
      await sentMessage.edit(response);
    }
  };