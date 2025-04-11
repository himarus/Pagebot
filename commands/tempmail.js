const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tempmail',
  description: 'Generate a temporary email address using OneSecMail',
  usage: 'tempmail',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    try {
      const { OneSecMailAPI } = await import('onesecmail'); // dynamic import for ESM support
      const api = new OneSecMailAPI();

      const [email] = await api.genRandomMailbox();
      const [login, domain] = email.split('@');

      await sendMessage(senderId, {
        text: `📨 Your temp mail:\n\n${email}\n\nUse *checker* command to check inbox:\nchecker ${login} ${domain}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Tempmail error:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ Failed to generate tempmail. Please try again later.`
      }, pageAccessToken);
    }
  }
};
