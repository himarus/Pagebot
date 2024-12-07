const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "feedback",
  description: "Submit feedback to the page admin and allow admin to reply",
  usage: "feedback <your message>\nExample: feedback This bot is awesome!",
  author: "chilli",
  
  async execute(senderId, args, pageAccessToken) {
    const adminId = "8731046750250922";

    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: "❗ Please provide your feedback.\n\nExample: feedback This bot is awesome!"
      }, pageAccessToken);
      return;
    }

    const feedbackMessage = args.join(" ");

    try {
      // Notify the user that their feedback was received
      await sendMessage(senderId, {
        text: "✅ Thank you for your feedback! Your message has been sent to the admin."
      }, pageAccessToken);

      // Send feedback notification to the admin
      const adminMessage = `📩 New Feedback Received:\n\n👤 From User ID: ${senderId}\n\n📝 Feedback: ${feedbackMessage}\n\nTo reply, send:\nreply ${senderId} <your message>`;
      await sendMessage(adminId, {
        text: adminMessage
      }, pageAccessToken);

    } catch (error) {
      console.error("Error sending feedback:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while sending your feedback. Please try again later."
      }, pageAccessToken);
    }
  }
};

// Reply Functionality
module.exports.reply = async function (senderId, args, pageAccessToken) {
  const adminId = "8731046750250922";

  if (senderId !== adminId) {
    await sendMessage(senderId, {
      text: "❗ Only the admin can use this command to reply to feedback."
    }, pageAccessToken);
    return;
  }

  const userId = args.shift(); // Extract user ID from the arguments
  const replyMessage = args.join(" ");

  if (!userId || !replyMessage) {
    await sendMessage(senderId, {
      text: "❗ Invalid usage. Use the format:\nreply <user_id> <your_message>"
    }, pageAccessToken);
    return;
  }

  try {
    // Send the admin's reply back to the user
    await sendMessage(userId, {
      text: `📩 Admin replied to your feedback:\n\n📝 ${replyMessage}`
    }, pageAccessToken);

    // Notify the admin of the successful reply
    await sendMessage(senderId, {
      text: `✅ Your reply has been sent to User ID: ${userId}.`
    }, pageAccessToken);

  } catch (error) {
    console.error("Error sending reply:", error.message || error);
    await sendMessage(senderId, {
      text: "⚠️ An error occurred while sending your reply. Please try again later."
    }, pageAccessToken);
  }
};
