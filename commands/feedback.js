const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "feedback",
  description: "Submit feedback to the page admin",
  usage: "feedback <your message>\nExample: feedback This bot is awesome!",
  author: "chilli",
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: "❗ Please provide your feedback.\n\nExample: feedback This bot is awesome!"
      }, pageAccessToken);
      return;
    }

    const feedbackMessage = args.join(" ");
    const adminId = "8731046750250922";

    try {
      await sendMessage(senderId, {
        text: "✅ Thank you for your feedback! Your message has been sent to the admin."
      }, pageAccessToken);

      const adminMessage = `📩 New Feedback Received:\n\n👤 From User ID: ${senderId}\n\n📝 Feedback: ${feedbackMessage}`;
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
