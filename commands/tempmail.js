const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tempmail',
  description: 'Generate a temporary email address',
  usage: 'tempmail',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    try {
      const { OneSecMailAPI } = await import('onesecmail');
      const api = new OneSecMailAPI();
      const [email] = await api.genRandomMailbox();

      await sendMessage(senderId, {
        text: `📧 Your temporary email: ${email}\n\nTo check inbox, use:\ninboxcheck ${email}`
      }, pageAccessToken);

    } catch (error) {
      console.error('Tempmail error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to generate tempmail. Please try again later.'
      }, pageAccessToken);
    }
  }
};
