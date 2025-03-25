const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const cooldowns = new Map();

module.exports = {
  name: 'sms',
  description: 'Send an SMS message with a custom sender name in the format: from|text|number',
  usage: 'sms <from|text|number>\nExample: sms ChilliBot|Hello|09123456789',
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
        text: '⚠️ Please provide sender, message, and number in this format:\n\nExample: sms ChilliBot|Hello|09123456789'
      }, pageAccessToken);
      return;
    }

    const input = args.join(' ');
    const parts = input.split('|');

    if (parts.length !== 3) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid format. Please use:\n\nExample: sms ChilliBot|Hello|09123456789'
      }, pageAccessToken);
      return;
    }

    let sender = parts[0].trim();
    let message = parts[1].trim();
    const number = parts[2].trim();

    const phoneNumberPattern = /^(09|\+639)\d{9}$/;
    if (!phoneNumberPattern.test(number)) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid phone number. Use a valid format: 09123456789 or +639123456789.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `https://haji-mix.up.railway.app/api/lbcsms`;
    const payload = { from: sender, text: message, number: number };

    try {
      const response = await axios.post(apiUrl, payload);
      let data = response.data;

      if (data.status) {
        let cleanMessage = message
          .replace(/📢 SMS Service Notice:[\s\S]*$/, '') // Remove everything after the notice
          .trim();

        await sendMessage(senderId, {
          text: `✅ SMS sent successfully!\n📩 From: ${sender}\n💬 Message: "${cleanMessage}"`
        }, pageAccessToken);

        cooldowns.set(senderId, Date.now());
        setTimeout(() => cooldowns.delete(senderId), cooldownTime);
      } else {
        await sendMessage(senderId, {
          text: `⚠️ Error: ${data.error || "Failed to send SMS. Please try again."}`
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error sending SMS:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ API Error: ${error.response?.data?.error || error.message || "An unexpected error occurred."}`
      }, pageAccessToken);
    }
  }
};
