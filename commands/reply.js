const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "reply",
  description: "Reply to user feedback",
  usage: "reply <user_id> <your message>\nExample: reply 8983074158485041 Thanks for the feedback!",
  author: "chilli",

  async execute(senderId, args, pageAccessToken) {
    const adminId = "8731046750250922"; 

    if (senderId !== adminId) {
      await sendMessage(senderId, {
        text: "❗ Only the admin can use this command to reply to feedback."
      }, pageAccessToken);
      return;
    }

    const userId = args.shift(); 
    const replyMessage = args.join(" "); 

    if (!userId || !replyMessage) {
      await sendMessage(senderId, {
        text: "❗ Invalid usage. Use the format:\nreply <user_id> <your_message>"
      }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(userId, {
        text: `📩 Admin replied to your feedback:\n\nMessage: ${replyMessage}`
      }, pageAccessToken);

      await sendMessage(senderId, {
        text: `✅ Your reply has been sent to User ID: ${userId}.`
      }, pageAccessToken);

    } catch (error) {
      console.error("Error sending reply:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while sending your reply. Please try again later."
      }, pageAccessToken);
    }
  }
};
