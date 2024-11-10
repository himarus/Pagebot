const colors = require('colors'); // Para sa colored console logging
const { sendMessage } = require('./sendMessage');
const commands = require('./commands'); // Your existing commands map

async function handleCommand(senderId, commandName, args, pageAccessToken) {
  // Auto-execute `ai` command if it exists in commands map
  if (commands.has('ai')) {
    try {
      await commands.get('ai').execute(senderId, [commandName, ...args], pageAccessToken, sendMessage);
    } catch (error) {
      console.error(`${colors.red}Error executing default universal command:${colors.reset}`, error);
      sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
    }
  } else {
    sendMessage(senderId, { text: 'Command not found and no default action available.' }, pageAccessToken);
  }
}

module.exports = { handleCommand };
