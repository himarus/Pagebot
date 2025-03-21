const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'song',
  description: 'Search and send an MP3 song from Yakzy API.',
  usage: 'song <song name>',
  author: 'your_name',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a song name. Example: song Bye Bye Dead Pool.' }, pageAccessToken);
      return;
    }

    const searchQuery = encodeURIComponent(args.join(' '));
    const apiUrl = `${api.yakzy}/sc?search=${searchQuery}`;

    try {
      await sendMessage(senderId, { text: '🔍 Searching for your song, please wait...' }, pageAccessToken);

      const response = await axios.get(apiUrl);
      console.log('API Response:', response.data); // DEBUGGING OUTPUT

      // Check if response has MP3 URL
      if (response.data && response.data.url) {
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: { url: response.data.url }
          }
        }, pageAccessToken);
      } else {
        throw new Error('No MP3 file found in API response.');
      }

    } catch (error) {
      console.error('Error in song command:', error.message || error);
      await sendMessage(senderId, { text: `Error: ${error.message || 'Could not retrieve the song. Please try again later.'}` }, pageAccessToken);
    }
  }
};
