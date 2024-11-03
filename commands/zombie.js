const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'zombie',
  description: 'Transformzombie.',
  usage: 'zombie',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken, lastImage) {
    if (!lastImage) {
      await sendMessage(senderId, { text: 'Please send an image first, then type "zombie" to transform it.' }, pageAccessToken);
      return;
    }

    const apiUrl = `https://www.samirxpikachu.run.place/zombie?imgurl=${encodeURIComponent(lastImage)}`;

    await sendMessage(senderId, { text: 'Transforming image... Please wait.' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error transforming image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while transforming the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
