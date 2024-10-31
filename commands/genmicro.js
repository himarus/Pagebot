const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'genmicro',
  description: 'Generate a temporary email and password using the JoshWeb API.',
  usage: 'genmicro <name>\nExample: genmicro kupal',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a name to generate a microsoft acc.\n\nUsage:\n genmicro <name>\nExample: genmicro kupal'
      }, pageAccessToken);
      return;
    }

    const name = args.join(' ');
    const apiUrl = `${api.joshWebApi}/api/genmicro?name=${encodeURIComponent(name)}`;

    await sendMessage(senderId, { text: 'Generating microsoft account... Please wait.' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const { email, password } = response.data.result;

      await sendMessage(senderId, {
        text: `Generated Microsoft account \n\nEmail: ${email}\nPassword: ${password}`
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating temporary email:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the temporary email. Please try again later.'
      }, pageAccessToken);
    }
  }
};
