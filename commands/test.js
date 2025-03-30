const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'test',
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

        const elements = images.map(imageUrl => ({
          title: `Image from Pinterest`,
          subtitle: `Search term: ${searchTerm}`,
          image_url: imageUrl,
          default_action: {
            type: "web_url",
            url: imageUrl,
            webview_height_ratio: "compact"
          },
          buttons: [
            {
              type: 'web_url',
              url: imageUrl,
              title: 'View Full Image'
            }
          ]
        }));

        const message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        };

        await sendMessage(senderId, message, pageAccessToken);
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
