const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover using user input and Imgur fallback',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(x => x.trim());
    const [A, B, C, D, E, F] = input;

    if (!A || !B || !C || !D || !E || !F) {
      return sendMessage(senderId, {
        text: '❌ Format:\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan'
      }, pageAccessToken);
    }

    try {
      const fbcoverUrl = `https://api.zetsu.xyz/canvas/fbcover?name=${encodeURIComponent(A)}&subname=${encodeURIComponent(B)}&sdt=${encodeURIComponent(C)}&address=${encodeURIComponent(D)}&email=${encodeURIComponent(E)}&uid=${senderId}&color=${encodeURIComponent(F)}`;

      const imgurUpload = await axios.get('https://betadash-uploader.vercel.app/imgur', {
        params: { link: fbcoverUrl }
      });

      const imgurImage = imgurUpload.data?.uploaded?.image;
      if (!imgurImage) throw new Error('Imgur upload failed');

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
            url: imgurImage,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error('FB Cover error:', err.message || err);
      await sendMessage(senderId, {
        text: '⚠️ Error: Could not generate or upload FB cover image.'
      }, pageAccessToken);
    }
  }
};
