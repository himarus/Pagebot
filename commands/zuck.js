const axios = require('axios');
const api = require('../handles/api');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'zuck',
  description: 'Generate a Mark Zuckerberg image with custom text.',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: '❗ Please provide text to generate the Zuck image.' }, pageAccessToken);
      return;
    }

    const inputText = args.join(' ');
    const apiUrl = `${api.kenlie2}/zuck?text=${encodeURIComponent(inputText)}`;

    try {
      // Fetch the image from the API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = response.data;

      // Send the image to the user
      await sendMessage(
        senderId,
        {
          attachment: {
            type: 'image',
            payload: {
              is_reusable: true,
              url: 'data:image/png;base64,' + Buffer.from(imageBuffer).toString('base64'),
            },
          },
        },
        pageAccessToken
      );
    } catch (error) {
      console.error('Error in Zuck command:', error.message);
      await sendMessage(senderId, { text: '🚧 An error occurred while generating the Zuck image.' }, pageAccessToken);
    }
  },
};
