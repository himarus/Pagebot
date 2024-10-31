const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'cdp',
  description: 'Send a random couple display picture using the Markdevs69 API.',
  usage: 'cdp\nExample: cdp',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    const apiUrl = `${api.joshWebApi}/cdp`;

    try {
      // Send a message indicating that the image is being fetched
      await sendMessage(senderId, {
        text: 'Fetching a random couple DP...'
      }, pageAccessToken);

      // Fetch the random couple DP from the API
      const response = await axios.get(apiUrl);
      const { one, two } = response.data.result;

      // Send the male DP image
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: one,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Send the female DP image
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: two,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching couple DP:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while fetching the couple DP. Please try again later.'
      }, pageAccessToken);
    }
  }
};
