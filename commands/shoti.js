const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "shoti",
  description: "Sends a random Chilli video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
      const { shotiurl: videoUrl } = response.data;

      if (args.length > 0 && args[0] === 'more') {
        // Send video directly without username and nickname
        await sendMessage(senderId, {
          attachment: {
            type: "video",
            payload: {
              url: videoUrl
            }
          }
        }, pageAccessToken);
      } else {
        const { username, nickname, duration } = response.data;

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
      console.error("Failed to fetch the Chilli video:", error);
      await sendMessage(senderId, {
        text: `Failed to fetch the Chilli video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
