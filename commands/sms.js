const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const cooldowns = new Map();

module.exports = {
  name: 'sms',
  description: 'Send a free SMS to PH numbers.',
  usage: 'sms <number>|<message>\nExample: sms 09814746590|Hello',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const now = Date.now();
    if (cooldowns.has(senderId) && now - cooldowns.get(senderId) < 5000) {
      return sendMessage(senderId, { text: '⏳ Please wait 5 seconds before using this command again.' }, pageAccessToken);
    }
    
    const input = args.join(' ').trim();
    const match = input.match(/^(\d{11})\s*\|\s*(.+)$/);

    if (!match) {
      return sendMessage(senderId, { text: '⚠️ Invalid format! Use: sms <number>|<message>\nExample: sms 09123456789|Hello' }, pageAccessToken);
    }

    const [, number, message] = match;

    try {
      const response = await axios.get(`https://wiegines3.vercel.app/api/freesms`, {
        params: { number, message, key: 'wiegine' }
      });

      if (response.data.success) {
        sendMessage(senderId, { text: `✅ SMS sent to ${number}: ${message}` }, pageAccessToken);
        cooldowns.set(senderId, now);
      } else {
        throw new Error('SMS sending failed.');
      }
    } catch (error) {
      console.error('Error in SMS command:', error.message || error);
      sendMessage(senderId, { text: '⚠️ Failed to send SMS. Please try again later.' }, pageAccessToken);
    }
  }
};
