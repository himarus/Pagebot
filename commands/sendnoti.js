const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

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
    let users = [];

    try {
      const data = fs.readFileSync('users.json', 'utf8');
      users = JSON.parse(data);

      if (users.length === 0) {
        await sendMessage(chilli, {
          text: "❗ No users found to send the notification to."
        }, cute);
        return;
      }

      const usersWithoutAdmin = users.filter(userId => userId !== adminId);

      for (const userId of usersWithoutAdmin) {
        const formattedMessage = `📢 **Notification from Admin**:\n\n${notificationMessage}`;
        await sendMessage(userId, { text: formattedMessage }, cute);
      }

      await sendMessage(chilli, {
        text: `✅ Notification successfully sent to ${usersWithoutAdmin.length} users.\n\n📢 **Message Sent**:\n${notificationMessage}`
      }, cute);
    } catch (error) {
      console.error("Error in sendnoti command:", error.message || error);
      await sendMessage(chilli, {
        text: "⚠️ An error occurred while sending notifications. Please try again later."
      }, cute);
    }
  }
};
