const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'tempmail',
  description: 'Generate temporary email or fetch inbox using Haji API',
  usage: 'tempmail [token]',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const apikey = api.haji.key;
    const baseUrl = api.haji.base;

    try {
      if (!args || args.length === 0) {
        const res = await axios.get(`${baseUrl}/api/tempgen`, {
          params: { apikey }
        });
        const { email, token } = res.data;

        await sendMessage(senderId, {
          text: `📧 Temporary Email Created:\n\nEmail: ${email}\nToken: ${token}\n\nTo check inbox, use:\n\ntempmail ${token}`
        }, pageAccessToken);

      } else {
        const token = args[0];
        const inboxRes = await axios.get(`${baseUrl}/api/tempinbox`, {
          params: { token, apikey }
        });
        const emails = inboxRes.data.emails;

        if (!emails || emails.length === 0) {
          return sendMessage(senderId, {
            text: `📭 No emails received yet for token: ${token}`
          }, pageAccessToken);
        }

        let inboxText = `📨 Inbox (${emails.length} message${emails.length > 1 ? 's' : ''}):\n\n`;
        emails.forEach((email, idx) => {
          inboxText += `${idx + 1}. From: ${email.from || 'Unknown Sender'}\nSubject: ${email.subject || 'No Subject'}\n\n`;
        });

        await sendMessage(senderId, {
          text: inboxText.trim()
        }, pageAccessToken);
      }

    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ Error: ${error.response ? JSON.stringify(error.response.data) : error.message || 'Unknown error.'}`
      }, pageAccessToken);
    }
  }
};
