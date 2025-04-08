const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image using user details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>\nExample: fbcover John Doe | Chill Dev | 123-456-7890 | QC, PH | john@example.com | 100010101010101 | red',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      await sendMessage(senderId, {
        text: 'Usage: fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>\n\nExample: fbcover John Doe | Chill Dev | 123-456-7890 | QC, PH | john@example.com | 100010101010101 | red'
      }, pageAccessToken);
      return;
    }

    const rawInput = args.join(' ').split('|').map(v => v.trim());

    if (rawInput.length < 7) {
      await sendMessage(senderId, {
        text: '⚠️ Incomplete input. Please provide all 7 fields separated by "|".\n\nExample: fbcover John Doe | Chill Dev | 123-456-7890 | QC, PH | john@example.com | 100010101010101 | red'
      }, pageAccessToken);
      return;
    }

    const [name, subname, sdt, address, email, uid, color] = rawInput;
    const apikey = '05b1c379d5886d1b846d45572ee1e0e';
    const imgbbKey = '79310ecb7673ce380ebd7c46652e3b9c';

    const imageUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${encodeURIComponent(uid)}&color=${encodeURIComponent(color)}&apikey=${apikey}`;

    try {
      // Step 1: Download image as buffer
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

      // Step 2: Upload to ImgBB
      const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, new URLSearchParams({
        image: imageBase64
      }));

      const uploadedUrl = imgbbRes?.data?.data?.url;

      if (!uploadedUrl) throw new Error('ImgBB upload failed');

      // Step 3: Send image via Messenger
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: uploadedUrl
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error generating fbcover:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating Facebook cover. Please try again later.'
      }, pageAccessToken);
    }
  }
};
