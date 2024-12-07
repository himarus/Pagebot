const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "sendnoti",
  description: "Send a notification to all users who messaged the bot",
  usage: "sendnoti <message>\nExample: sendnoti Hello users!",
  author: "chilli",

  async execute(chilli, pogi, cute) {
    const adminId = "8731046750250922";

    if (chilli !== adminId) {
      await sendMessage(chilli, {
        text: "❗ This command is only available to the admin."
      }, cute);
      return;
    }

    if (!pogi || pogi.length === 0) {
      await sendMessage(chilli, {
        text: "❗ Please provide a message to send.\n\nExample: sendnoti Hello users!"
      }, cute);
      return;
    }

    const notificationMessage = pogi.join(" ");
    const formattedMessage = `📢 **Notification from Admin**:\n\n${notificationMessage}`;

    try {
      const response = await axios.get(`https://graph.facebook.com/v15.0/me/conversations`, {
        params: {
          access_token: cute
        }
      });

      const conversations = response.data.data;
      if (!conversations || conversations.length === 0) {
        await sendMessage(chilli, {
          text: "❗ No users found to send the notification to."
        }, cute);
        return;
      }

      const userIds = conversations
        .map(convo => convo.participants.data.find(participant => participant.id !== "me").id)
        .filter(id => id !== adminId);

      for (const userId of userIds) {
        await sendMessage(userId, { text: formattedMessage }, cute);
      }

      await sendMessage(chilli, {
        text: `✅ Notification successfully sent to ${userIds.length} users.\n\n📢 **Message Sent**:\n${notificationMessage}`
      }, cute);
    } catch (error) {
      console.error("Error in sendnoti command:", error.message || error);
      await sendMessage(chilli, {
        text: "⚠️ An error occurred while sending notifications. Please try again later."
      }, cute);
    }
  }
};
