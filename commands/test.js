const { sendMessage } = require('../handles/sendMessage');
const getLyrics = require('@faouzkk/lyrics-finder');

module.exports = {
  name: 'test',
  description: 'Find song lyrics by title or artist+title',
  usage: 'lyrics <song title> or <artist> - <title>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      return sendMessage(senderId, {
        text: 'Please enter a song title.\nUsage: lyrics <title> or <artist> - <title>'
      }, pageAccessToken);
    }

    // Processing indicator
    await sendMessage(senderId, {
      text: `[🔍] Searching lyrics for "${args.join(' ')}"...`
    }, pageAccessToken);

    try {
      const searchQuery = args.join(' ');
      const lyrics = await getLyrics(searchQuery);

      if (!lyrics || lyrics.includes('Not Found!')) {
        return sendMessage(senderId, {
          text: `❌ Lyrics not found for "${searchQuery}"`
        }, pageAccessToken);
      }

      // Format lyrics with basic formatting
      const formattedLyrics = lyrics
        .replace(/\n/g, '\n\n')
        .substring(0, 2000); // Truncate to avoid character limit

      await sendMessage(senderId, {
        text: `🎶 Lyrics for "${searchQuery}":\n\n${formattedLyrics}${lyrics.length > 2000 ? '\n[...] Lyrics truncated due to length' : ''}`
      }, pageAccessToken);

    } catch (error) {
      console.error('Lyrics command error:', error);
      await sendMessage(senderId, {
        text: `⚠️ Error fetching lyrics: ${error.message}`
      }, pageAccessToken);
    }
  }
};
