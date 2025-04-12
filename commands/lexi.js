const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'lexi',
  description: 'Generate a lexi-style image using Jonel API',
  usage: 'lexi <text>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide text. Example: lexi i hate mondays' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const imageUrl = `${api.jonel}/api/lexi?text=${encodeURIComponent(text)}&type=direct`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error sending lexi image:', error);
      await sendMessage(senderId, { text: '⚠️ Failed to generate lexi image.' }, pageAccessToken);
    }
  }
};
