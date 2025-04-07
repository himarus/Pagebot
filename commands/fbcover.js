const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a custom Facebook cover image using your profile pic.',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(s => s.trim());
    const [A, B, C, D, E, F] = input;

    if (!A || !B || !C || !D || !E || !F) {
      return sendMessage(senderId, {
        text: '❌ Format:\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan'
      }, pageAccessToken);
    }

    try {
      const profile = await axios.get(`https://graph.facebook.com/${senderId}`, {
        params: {
          fields: 'profile_pic',
          access_token: pageAccessToken
        }
      });

      const pic = profile.data?.profile_pic;
      if (!pic) throw new Error('No profile pic');

      const reupload = await axios.get('https://betadash-uploader.vercel.app/imgur', {
        params: { link: pic }
      });

      const img = reupload.data?.uploaded?.image;
      if (!img) throw new Error('Imgur upload failed');

      const url = `https://api.zetsu.xyz/canvas/fbcover?name=${encodeURIComponent(A)}&subname=${encodeURIComponent(B)}&sdt=${encodeURIComponent(C)}&address=${encodeURIComponent(D)}&email=${encodeURIComponent(E)}&uid=${encodeURIComponent(img)}&color=${encodeURIComponent(F)}`;

      await sendMessage(senderId, {
        text:
`✅ FB Cover Details:

• Name: ${A}
• Subname: ${B}
• SDT: ${C}
• Address: ${D}
• Email: ${E}
• Color: ${F}`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: url,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error('FB Cover error:', err.message || err);
      await sendMessage(senderId, {
        text: '⚠️ Error: Failed to generate FB cover. Please try again.'
      }, pageAccessToken);
    }
  }
};
