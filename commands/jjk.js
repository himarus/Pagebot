

const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'jjk',
  description: 'send arandom jijikey vid',
  usage: 'randomjjk',
  author: 'bebe cia',

  async execute(senderId, args, pageAccessToken) {
    const apiUrl = `${api.kaizen.base}/api/random-jjk?apikey=${api.kaizen.key}`;

    try {
      const { data } = await axios.get(apiUrl);
      const { post_by, username, content, video_url } = data;

      const caption = `🎬 𝙍𝙖𝙣𝙙𝙤𝙢 𝙅𝙅𝙆 𝙀𝙙𝙞𝙩\n\nPosted by: ${post_by} (@${username})\n\n${content}`;

      await sendMessage(senderId, {
        text: caption
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: video_url
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error fetching JJK video:", error.message || error);
      await sendMessage(senderId, {
        text: 'Failed to fetch a random JJK edit. Please try again later.'
      }, pageAccessToken);
    }
  }
};
