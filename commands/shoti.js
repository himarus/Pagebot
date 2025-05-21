const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "shoti",
  description: "Sends a random Shoti video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken) {
    try {
      const { data: videoUrl } = await axios.get(`${api.haji.base}/api/shoti`, {
        params: {
          stream: true,
          api_key: api.haji.key
        }
      });

      if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error("Invalid video URL received from API.");
      }

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: { url: videoUrl }
        }
      }, pageAccessToken);

      if (!(args.length > 0 && args[0].toLowerCase() === 'more')) {
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
      console.error("Failed to fetch the Shoti video:", error);
      await sendMessage(senderId, {
        text: `Failed to fetch the Shoti video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
