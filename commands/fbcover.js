const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image using user details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>\nExample: fbcover Churchill | Chill Dev | 09123456789 | PH | chill@example.com | 100087212564100 | cyan',
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
    const joshUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${encodeURIComponent(uid)}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0e`;

    const imgbbKey = '1853a90240cf6cebbfe191fa0112d154';

    try {
      // Upload to ImgBB
      const imgbbRes = await axios.post('https://api.imgbb.com/1/upload', null, {
        params: {
          key: imgbbKey,
          image: joshUrl
        }
      });

      const hostedImage = imgbbRes.data?.data?.url;

      if (!hostedImage) throw new Error("ImgBB upload failed.");

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: hostedImage,
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
