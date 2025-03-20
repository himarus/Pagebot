const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'test',
  description: 'Search for Pinterest images using the Kaizen API.',
  usage: 'pinterest <search-term> - <number-of-images>\nExample: pinterest cat - 10',
  author: 'your_name',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ');
    const regex = /^pinterest\s+(.+?)-\s*(\d+)$/i;
    const match = input.match(regex);

    if (!match) {
      await sendMessage(senderId, {
        text: 'Invalid format. Please use the correct format: pinterest <search-term> - <number-of-images>\nExample: pinterest cat - 10'
      }, pageAccessToken);
      return;
    }

    const searchTerm = match[1].trim();
    const numberOfImages = parseInt(match[2], 10);

    if (isNaN(numberOfImages) || numberOfImages <= 0) {
      await sendMessage(senderId, {
        text: 'Please provide a valid number of images greater than 0.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/pinterest?search=${encodeURIComponent(searchTerm)}&limit=${numberOfImages}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && Array.isArray(response.data.results)) {
        const images = response.data.results.slice(0, numberOfImages);
        const elements = images.map(image => ({
          title: image.title || 'Pinterest Image',
          image_url: image.url,
          subtitle: image.description || '',
          default_action: {
            type: 'web_url',
            url: image.url
          }
        }));

        await sendMessage(senderId, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in pinterest command:', error.message || error);
      await sendMessage(senderId, {
        text: 'Error: Could not retrieve images. Please try again later.'
      }, pageAccessToken);
    }
  }
};
