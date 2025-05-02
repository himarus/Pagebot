const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "shoti",
  description: "Sends a random Shoti video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get('https://rapido.zetsu.xyz/api/shoti');
      const {
        video_url: videoUrl,
        username,
        nickname,
        duration_ms
      } = response.data;

      const duration = (duration_ms / 1000).toFixed(1);
      const delayMs = Math.min(duration_ms + 1000, 10000); // max wait = 10s

      if (args.length > 0 && args[0] === 'more') {
        await sendMessage(senderId, {
          attachment: {
            type: "video",
            payload: {
              url: videoUrl
            }
          }
        }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, {
        text: `Username: ${username}\nNickname: ${nickname}\nDuration: ${duration} seconds`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

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
      }, delayMs);
    } catch (error) {
      console.error("Failed to fetch the Shoti video:", error);
      await sendMessage(senderId, {
        text: `Failed to fetch the Shoti video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
