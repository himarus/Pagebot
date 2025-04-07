const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a custom Facebook cover image with your details.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const fullInput = args.join(' ').split('|').map(str => str.trim());
    const [name, subname, sdt, address, email, color] = fullInput;

    if (!name || !subname || !sdt || !address || !email || !color) {
      return sendMessage(senderId, {
        text: '❌ Format:\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>'
      }, pageAccessToken);
    }

    try {
      // Get user's profile picture via Graph API
      const picRes = await axios.get(`https://graph.facebook.com/v21.0/${senderId}/picture`, {
        params: {
          access_token: pageAccessToken,
          type: 'large',
          redirect: false
        }
      });

      const profilePic = picRes.data?.data?.url;

      if (!profilePic) {
        throw new Error('Could not fetch profile picture.');
      }

      const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&avatar=${encodeURIComponent(profilePic)}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

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
        text: '⚠️ Failed to generate FB cover. Check if profile pic is accessible.'
      }, pageAccessToken);
    }
  }
};
