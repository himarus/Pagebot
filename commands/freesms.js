const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'freesms',
  description: 'Send free SMS using the FreeSMS API.',
  usage: 'freesms <number> | <message>\nExample: freesms 09123456789 | Hello there!',
  author: 'Chilli',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|');
    const number = input[0]?.trim();
    const message = input[1]?.trim();

    if (!number || !message) {
      return await sendMessage(senderId, {
        text: `❗ **Incorrect Format**\n\nUse this format:\n\`\`\`freesms number | message\`\`\`\n\n📌 Example:\n\`freesms 09123456789 | Hello, how are you?\`\n\n👉 *Make sure to test with your own number to verify if it works.*`
      }, pageAccessToken);
    }

    if (!/^(09|\+639)\d{9}$/.test(number)) {
      return await sendMessage(senderId, {
        text: `⚠️ Invalid phone number format.\nUse a valid PH number starting with 09 or +639.\n\nExample:\n\`freesms 09123456789 | Hi kupal\``
      }, pageAccessToken);
    }

    const apiUrl = `${api.kenlie}/freesmslbc/?number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}`;

    await sendMessage(senderId, {
      text: `📤 Sending SMS to **${number}**...\n💬 Message: "${message}"\n\n🔄 Please wait for confirmation.`
    }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const { status, response: apiResponse, sim_network, message_parts, message_remaining } = response.data;

      if (status) {
        const details = `✅ **SMS Sent Successfully!**\n\n📞 **To**: ${number}\n📡 **Network**: ${sim_network}\n🧩 **Message Parts**: ${message_parts}\n📊 **Remaining Messages**: ${Math.floor(message_remaining).toLocaleString()}\n\n💌 **Response**: "${apiResponse}"`;
        await sendMessage(senderId, { text: details }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: `❌ **Error:** Failed to send SMS.\n\n💌 **Response:** ${apiResponse || 'No additional details provided.'}`
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error in freesms command:', error.message || error);
      await sendMessage(senderId, {
        text: `❌ **Error:** Unable to send SMS. Please try again later.\n\n**Details:** ${error.message || 'Unknown error.'}`
      }, pageAccessToken);
    }
  }
};
