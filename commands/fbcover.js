const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a custom Facebook cover image with your details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const fullInput = args.join(' ').split('|').map(str => str.trim());
    const [name, subname, sdt, address, email, color] = fullInput;

    if (!name || !subname || !sdt || !address || !email || !color) {
      return sendMessage(senderId, {
        text: '❌ Please use the correct format:\n\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan'
      }, pageAccessToken);
    }

    const uid = senderId.slice(-6);
    const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${uid}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('FB Cover error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error: Failed to generate Facebook cover image. Please try again.'
      }, pageAccessToken);
    }
  }
};
