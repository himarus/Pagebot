const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image using user details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      await sendMessage(senderId, {
        text: 'Usage: fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>'
      }, pageAccessToken);
      return;
    }

    const rawInput = args.join(' ').split('|').map(v => v.trim());

    if (rawInput.length < 7) {
      await sendMessage(senderId, {
        text: 'Incomplete input. Please provide all 7 fields separated by "|".'
      }, pageAccessToken);
      return;
    }

    const [name, subname, sdt, address, email, uid, color] = rawInput;
    const apikey = '05b1c379d5886d1b846d45572ee1e0e';

    const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${encodeURIComponent(uid)}&color=${encodeURIComponent(color)}&apikey=${apikey}`;

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
      console.error('Error generating fbcover:', error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating Facebook cover. Please try again.'
      }, pageAccessToken);
    }
  }
};
