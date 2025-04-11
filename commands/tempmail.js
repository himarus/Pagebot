const TempMail = require('node-temp-mail');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tempmail',
  description: 'Generate a temporary email address and fetch inbox messages.',
  usage: 'tempmail',
  author: 'Churchill',

  async execute(senderId, args, pageAccessToken) {
    try {
      const randomString = Math.random().toString(36).substring(2, 10);
      const address = new TempMail(randomString);
      const tempEmail = address.getAddress();

      await sendMessage(senderId, {
        text: `📧 Your temporary email:\n${tempEmail}\n\nWe'll check for messages shortly...`
      }, pageAccessToken);

      setTimeout(async () => {
        try {
          const inbox = await address.fetchEmails();
          if (inbox.length === 0) {
            await sendMessage(senderId, {
              text: '📭 No new messages received yet.'
            }, pageAccessToken);
          } else {
            const messages = inbox.map(email => `📨 From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}`).join('\n\n');
            await sendMessage(senderId, {
              text: messages
            }, pageAccessToken);
          }
        } catch (err) {
          await sendMessage(senderId, {
            text: '⚠️ Error checking inbox.'
          }, pageAccessToken);
        }
      }, 30000);
    } catch (err) {
      await sendMessage(senderId, {
        text: '⚠️ Failed to generate a tempmail.'
      }, pageAccessToken);
    }
  }
}
