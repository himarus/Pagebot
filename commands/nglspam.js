const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "nglspam",
  description: "Send spam messages using NGL API with the correct format.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length !== 3) {
      return sendMessage(senderId, { text: "❌ Invalid format. Usage:\n\nnglspam username | message | count" }, pageAccessToken);
    }

    const [username, message, count] = input;
    const total = parseInt(count, 10);

    // Check if username is in a valid format (not a link or invalid characters)
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username) || username.startsWith("http") || username.startsWith("www")) {
      return sendMessage(senderId, { text: "❌ Invalid username format. Please use a valid username (no links or special characters)." }, pageAccessToken);
    }

    if (isNaN(total) || total <= 0) {
      return sendMessage(senderId, { text: "❌ The count must be a positive integer." }, pageAccessToken);
    }

    sendMessage(senderId, { text: `📩 Sending ${total} messages to **${username}**...` }, pageAccessToken);

    try {
      const apiUrl = `${api.mark2}/api/other/nglspam?username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}&total=${total}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status === true) {
        sendMessage(senderId, { text: `✅ ${response.data.result}` }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: "⚠️ Failed to send messages. Please check the details and try again." }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in NGL Spam command:", error);
      sendMessage(senderId, { text: "⚠️ An error occurred while sending the messages. Please try again." }, pageAccessToken);
    }
  }
};
