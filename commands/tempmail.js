const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'tempmail',
  description: 'Generate a temporary email and retrieve confirmation codes automatically.',
  author: 'chilli',

  async execute(kupal, pogi, chillax) {
    try {
      const { data: kupalResponse } = await axios.get(`${api.nethApi}/api/tempmail-create?`);
      if (!kupalResponse.status || !kupalResponse.address) {
        return sendMessage(kupal, { text: 'Failed to generate a temporary email. Please try again.' }, chillax);
      }

      const tempEmail = kupalResponse.address;
      await sendMessage(kupal, { text: tempEmail }, chillax);

      const pogiInterval = setInterval(async () => {
        try {
          const { data: chillaxResponse } = await axios.get(`${api.nethApi}/api/tempmail-get?email=${encodeURIComponent(tempEmail)}`);
          
          if (chillaxResponse.status && chillaxResponse.messages.length > 0) {
            const latestMessage = chillaxResponse.messages[0];

            if (latestMessage) {
              const fullMessage = `📩 *New Email Received*\n\n*From:* ${latestMessage.from}\n*Subject:* ${latestMessage.subject}\n*Date:* ${latestMessage.date}\n\n*Message:*\n${latestMessage.message}`;

              await sendMessage(kupal, { text: fullMessage }, chillax);
              clearInterval(pogiInterval);
            }
          }
        } catch (pogiError) {
          console.error('Error checking email:', pogiError);
        }
      }, 10000);

    } catch (pogiError) {
      console.error('Error generating temp email:', pogiError);
      await sendMessage(kupal, { text: 'An error occurred while creating the temporary email. Please try again.' }, chillax);
    }
  }
};
