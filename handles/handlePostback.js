const { sendMessage } = require('./sendMessage');
const testCommand = require('../commands/test');

const handlePostback = async (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (!senderId || !payload) {
    console.error('Invalid postback event');
    return;
  }

  try {
    if (payload === 'GET_STARTED_PAYLOAD') {
      const welcomeMessage = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `Welcome to CHILLI BOT!\n\nI'm your AI-powered assistant, here to make things smoother!\n\nTERMS OF SERVICE & PRIVACY POLICY\n\nBy using this bot, you agree to:\n1. Interaction: Automated responses may log interactions to improve service.\n2. Data: We collect data to enhance functionality without sharing it.\n3. Security: Your data is protected.\n4. Compliance: Follow Facebook's terms or risk access restrictions.\n5. Updates: Terms may change, and continued use implies acceptance.\n\nFailure to comply may result in access restrictions.`,
            buttons: [{
              type: "web_url",
              url: "https://privacy-policy-jet-sigma.vercel.app/",
              title: "PRIVACY POLICY"
            }]
          }
        },
        quick_replies: [{
          content_type: "text",
          title: "Help",
          payload: "HELP_PAYLOAD"
        }]
      };
      
      await sendMessage(senderId, welcomeMessage, pageAccessToken);
    }
    else if (payload.startsWith('PLAY_FULL_')) {
      await testCommand.handlePostback(senderId, payload, pageAccessToken);
    }
    
  } catch (error) {
    console.error('Postback Error:', error);
    await sendMessage(senderId, { 
      text: "System error. Please try again later." 
    }, pageAccessToken);
  }
};

module.exports = { handlePostback };
