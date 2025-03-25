const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const cooldowns = new Map();

module.exports = {
  name: 'sms',
  description: 'Send an SMS message to a specified number in the format: text|number or text | number',
  usage: 'sms <text|number>\nExample: sms Hichill|09123456789',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const cooldownTime = 10 * 1000;
    const lastUsed = cooldowns.get(senderId);

    if (lastUsed && Date.now() - lastUsed < cooldownTime) {
      const remainingTime = ((cooldownTime - (Date.now() - lastUsed)) / 1000).toFixed(1);
      await sendMessage(senderId, {
        text: `⚠️ You are on cooldown! Please wait ${remainingTime} seconds before sending another SMS.`
      }, pageAccessToken);
      return;
    }

    if (args.length === 0) {
      await sendMessage(senderId, {
        text: '⚠️ Please provide a message and a number in the format:\n\nExample: sms Hichill | 09123456789'
      }, pageAccessToken);
      return;
    }

    const input = args.join(' ');
    const parts = input.split('|');

    if (parts.length !== 2) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid format. Please use like this\n\nExample: sms Hichill | 09123456789'
      }, pageAccessToken);
      return;
    }

    let message = parts[0].trim();
    const number = parts[1].trim();

    const phoneNumberPattern = /^(09|\+639)\d{9}$/;
    if (!phoneNumberPattern.test(number)) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid phone number. Use a valid format: 09123456789 or +639123456789.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `https://haji-mix.up.railway.app/api/lbcsms?text=${encodeURIComponent(message)}&number=${encodeURIComponent(number)}`;

    try {
      const response = await axios.get(apiUrl);
      let data = response.data;

      if (data.status) {
        let filteredMessage = data.message
          .replace(/📨 From: Anonymous[\s\S]*💬 Message:/, '') // Removes "📨 From: Anonymous" and "💬 Message:"
          .replace(/📢 SMS Service Notice:[\s\S]*$/, '') // Removes "📢 SMS Service Notice" and extra disclaimer
          .trim();

        await sendMessage(senderId, {
          text: `✅ SMS sent successfully!\nMessage sent: "${filteredMessage}"`
        }, pageAccessToken);

        cooldowns.set(senderId, Date.now());
        setTimeout(() => cooldowns.delete(senderId), cooldownTime);
      } else if (data.error) {
        await sendMessage(senderId, {
          text: `⚠️ ${data.error}`
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Failed to send SMS. Please try again.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error sending SMS:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while sending the SMS. Please try again later.'
      }, pageAccessToken);
    }
  }
};
