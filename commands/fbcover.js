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
        text: '❌ Format:\nfbcover <name> | <subname> | <sdt> | <address> | <email> | <color>\n\nExample:\nfbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan'
      }, pageAccessToken);
    }

    try {
      // Fetch profile picture URL
      const picRes = await axios.get(`https://graph.facebook.com/v21.0/${senderId}/picture`, {
        params: {
          access_token: pageAccessToken,
          type: 'large',
          redirect: false
        }
      });

      const profilePic = picRes.data?.data?.url;
      if (!profilePic) throw new Error('Could not fetch profile picture.');

      // Build image generation API URL
      const imageUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&avatar=${encodeURIComponent(profilePic)}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

      // Upload image first to avoid (#100) error
      const uploadRes = await axios.post(
        `https://graph.facebook.com/v21.0/me/message_attachments?access_token=${pageAccessToken}`,
        {
          message: {
            attachment: {
              type: 'image',
              payload: {
                is_reusable: true,
                url: imageUrl
              }
            }
          }
        }
      );

      const attachmentId = uploadRes.data.attachment_id;

      // Send confirmation + attachment
      await sendMessage(senderId, {
        text:
`✅ Your custom FB cover has been generated!

• Name: ${name}
• Subname: ${subname}
• SDT: ${sdt}
• Address: ${address}
• Email: ${email}
• Color: ${color}

Here's your image:`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: attachmentId
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('FB Cover error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating FB cover. Please try again later or double-check your input.'
      }, pageAccessToken);
    }
  }
};
