const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'inboxcheck',
  description: 'Check inbox of a tempmail email',
  usage: 'inboxcheck <email>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0 || !args[0].includes('@')) {
      await sendMessage(senderId, {
        text: '❗ Please provide a valid tempmail email.\nExample: inboxcheck demo@1secmail.com'
      }, pageAccessToken);
      return;
    }

    try {
      const { OneSecMailAPI } = await import('onesecmail');
      const email = args[0];
      const [login, domain] = email.split('@');
      const api = new OneSecMailAPI();

      const messages = await api.getMessages(login, domain);

      if (messages.length === 0) {
        await sendMessage(senderId, {
          text: `📭 No new messages found in ${email}`
        }, pageAccessToken);
        return;
      }

      for (const msg of messages) {
        const fullMessage = await api.readMessage(login, domain, msg.id);

        await sendMessage(senderId, {
          text: `📬 Message in ${email}\n\nFrom: ${fullMessage.from}\nSubject: ${fullMessage.subject}\n\n${fullMessage.textBody || 'No content.'}`
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Inboxcheck error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error checking inbox. Please try again later.'
      }, pageAccessToken);
    }
  }
};
