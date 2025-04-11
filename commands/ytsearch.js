const yts = require('yt-search');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ytsearch',
  description: 'Search YouTube videos',
  usage: 'ytsearch <keyword>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(senderId, { text: 'Usage: ytsearch <keyword>' }, pageAccessToken);
    }

    try {
      const result = await yts(query);
      const videos = result.videos.slice(0, 5); // top 5 videos

      if (videos.length === 0) {
        return sendMessage(senderId, { text: 'No results found.' }, pageAccessToken);
      }

      let message = `🔍 YouTube Search Results for "${query}":\n\n`;
      videos.forEach((v, i) => {
        message += `#${i + 1} ${v.title} (${v.timestamp})\nBy: ${v.author.name}\nViews: ${v.views.toLocaleString()}\nLink: ${v.url}\n\n`;
      });

      await sendMessage(senderId, { text: message.trim() }, pageAccessToken);
    } catch (error) {
      console.error('ytsearch error:', error.message || error);
      await sendMessage(senderId, { text: 'Error fetching YouTube results. Try again later.' }, pageAccessToken);
    }
  }
};
