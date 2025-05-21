const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "shoti",
  description: "Sends a random Shoti video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken, event) {
    const directVideoUrl = `${api.haji.base}/api/shoti?stream=true&api_key=${api.haji.key}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: { url: directVideoUrl }
        }
      }, pageAccessToken);

      // Only send follow-up quick replies if NOT a response to previous quick reply
      if (!event?.message?.quick_reply) {
        setTimeout(() => {
          sendMessage(senderId, {
            text: "Want to see more Shoti videos?",
            quick_replies: [
              {
                content_type: "text",
                title: "More Shoti",
                payload: "MORE_SHOTI"
              },
              {
                content_type: "text",
                title: "No More Shoti",
                payload: "NO_MORE_SHOTI"
              }
            ]
          }, pageAccessToken);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to send the Shoti video:", error);
      await sendMessage(senderId, {
        text: `Failed to send the Shoti video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
