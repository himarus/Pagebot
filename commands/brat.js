const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'brat',
  description: 'Generate brat style image',
  usage: 'brat <text>',
  author: 'churchill',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide text. Example: brat you suck' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const imageUrl = `${api.jonel}/api/brat?text=${encodeURIComponent(text)}&type=direct`;

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
      console.error('Error sending brat image:', error);
      await sendMessage(senderId, { text: '⚠️ Failed to generate brat image.' }, pageAccessToken);
    }
  }
};
