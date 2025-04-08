const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image using user details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>\nExample: fbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | 100087212564100 | Cyan',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      await sendMessage(senderId, {
        text: `📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗖𝗼𝘃𝗲𝗿 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿

Usage: fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>

Example:
fbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | 100087212564100 | Cyan`
      }, pageAccessToken);
      return;
    }

    const rawInput = args.join(' ').split('|').map(v => v.trim());

    if (rawInput.length < 7) {
      await sendMessage(senderId, {
        text: '⚠️ Incomplete input. Please provide all 7 fields separated by "|".'
      }, pageAccessToken);
      return;
    }

    const [name, subname, sdt, address, email, uid, color] = rawInput;
    const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${encodeURIComponent(uid)}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      await sendMessage(senderId, {
        text: `[ ⏳ ] 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗖𝗼𝘃𝗲𝗿...\n\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁.`
      }, pageAccessToken);

      await axios.get(apiUrl, { responseType: 'arraybuffer' });

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
      console.error('Error generating fbcover:', error?.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating Facebook cover. Please try again later.'
      }, pageAccessToken);
    }
  }
};
