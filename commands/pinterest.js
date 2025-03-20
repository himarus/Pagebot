const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'pinterest',
  description: 'Search for images on Pinterest using the Kaizen API.',
  usage: 'pinterest <search-term> - <number-of-images>\nExample: pinterest cat - 10',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ');
    const regex = /^(.+?)-\s*(\d+)$/i;
    const match = input.match(regex);

    if (!match) {
      await sendMessage(senderId, {
        text: '❌ Invalid format! Use: pinterest <search-term> - <number-of-images>\n✅ Example: pinterest cat - 10'
      }, pageAccessToken);
      return;
    }

    const searchTerm = match[1].trim();
    const numberOfImages = parseInt(match[2], 10);

    if (isNaN(numberOfImages) || numberOfImages <= 0) {
      await sendMessage(senderId, {
        text: '❌ Please provide a valid number of images (greater than 0).'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/pinterest?search=${encodeURIComponent(searchTerm)}&limit=${numberOfImages}`;

    try {
      await sendMessage(senderId, { text: `🔎 Searching Pinterest for "${searchTerm}"...` }, pageAccessToken);

      const response = await axios.get(apiUrl);

      if (response.data && Array.isArray(response.data.data)) {
        const images = response.data.data.slice(0, numberOfImages);

        for (const imageUrl of images) {
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: { url: imageUrl }
            }
          }, pageAccessToken);
        }
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in pinterest command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error fetching images. Please try again later.'
      }, pageAccessToken);
    }
  }
};
