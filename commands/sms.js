const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'sms',
  description: 'Send an SMS message to a specified number in the format: text|number',
  usage: 'sms <text|number>\nExample: sms Hichill|09123456789',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a message and a number in the format: text|number. Example: sms Hichill|09123456789'
      }, pageAccessToken);
      return;
    }

    const input = args.join(' ');
    const [message, number] = input.split('|');

    // Validate the number format (Philippine mobile number)
    const phoneNumberPattern = /^(09|\+639)\d{9}$/;
    if (!message || !number) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid format. Please use: text|number. Example: sms Hichill | 09123456789'
      }, pageAccessToken);
      return;
    }

    if (!phoneNumberPattern.test(number)) {
      await sendMessage(senderId, {
        text: '⚠️ Invalid phone number. Please use a valid Philippine mobile number format (e.g., 09123456789 or +639123456789).'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `https://haji-mix.up.railway.app/api/lbcsms?text=${encodeURIComponent(message)}&number=${encodeURIComponent(number)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status) {
        await sendMessage(senderId, {
          text: `✅ SMS sent successfully!\nMessage sent: "${message}"`
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
