const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a custom Facebook cover image using your profile picture.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const fullInput = args.join(' ').split('|').map(str => str.trim());
    const [name, subname, sdt, address, email, color] = fullInput;

    if (!name || !subname || !sdt || !address || !email || !color) {
      return sendMessage(senderId, {
        text: '❌ Format:\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan'
      }, pageAccessToken);
    }

    try {
      // Get profile pic from Graph API
      const profileRes = await axios.get(`https://graph.facebook.com/${senderId}`, {
        params: {
          fields: 'profile_pic',
          access_token: pageAccessToken
        }
      });

      const profilePicUrl = profileRes.data?.profile_pic;

      if (!profilePicUrl) throw new Error('No profile pic found.');

      const apiUrl = `https://api.zetsu.xyz/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${encodeURIComponent(profilePicUrl)}&color=${encodeURIComponent(color)}`;

      // 1st message (text info)
      await sendMessage(senderId, {
        text:
`✅ FB Cover Details:

• Name: ${name}
• Subname: ${subname}
• SDT: ${sdt}
• Address: ${address}
• Email: ${email}
• Color: ${color}`
      }, pageAccessToken);

      // 2nd message (image)
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
        text: '⚠️ Error: Failed to generate FB cover. Please try again.'
      }, pageAccessToken);
    }
  }
};
