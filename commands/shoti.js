
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "shoti",
  description: "Sends a random Haji Shoti video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get(`${api.haji}/api/shoti?stream=true`);
      const { url: videoUrl } = response.data;

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

      if (!(args.length > 0 && args[0] === 'more')) {
        await sendMessage(senderId, {
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
      }

    } catch (error) {
      console.error("Failed to fetch the Haji video:", error);
      await sendMessage(senderId, {
        text: `Failed to fetch the Haji video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
