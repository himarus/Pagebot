const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, '../commands', file));
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
  }
}

async function handleCommand(senderId, commandName, args, pageAccessToken) {
  // Auto-execute `ai` command if it exists in commands map
  if (commands.has('ai')) {
    try {
      await commands.get('ai').execute(senderId, [commandName, ...args], pageAccessToken, sendMessage);
    } catch (error) {
      console.error('Error executing default universal command:', error);
      sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
    }
  } else {
    sendMessage(senderId, { text: 'Command not found and no default action available.' }, pageAccessToken);
  }
}

module.exports = { handleCommand };
