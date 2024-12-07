const { sendMessage } = require('./sendMessage');

// Function to handle incoming messages
const handleMessage = async (event, pageAccessToken) => {
  const chilli = event.sender?.id;
  const message = event.message?.text?.toLowerCase();  // Get the text message and make it lowercase

  if (chilli && message) {
    if (message === 'get started') {
      const combinedMessage = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `🔥 Welcome to CHILLI BOT! 🔥\n\nI'm your AI-powered assistant, here to make things spicier and smoother! 🌶️\n\n𝗧𝗘𝗥𝗠𝗦 𝗢𝗙 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 & 𝗣𝗥𝗜𝗩𝗔𝗖𝗬 𝗣𝗢𝗟𝗜𝗖𝗬\n\nBy using this bot, you agree to:\n1. 𝗜𝗻𝘁𝗲𝗿𝗮𝗰𝘁𝗶𝗼𝗻: Automated responses may log interactions to improve service.\n2. 𝗗𝗮𝘁𝗮: We collect data to enhance functionality without sharing it.\n3. 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: Your data is protected.\n4. 𝗖𝗼𝗺𝗽𝗹𝗶𝗮𝗻𝗰𝗲: Follow Facebook's terms or risk access restrictions.\n5. 𝗨𝗽𝗱𝗮𝘁𝗲𝘀: Terms may change, and continued use implies acceptance.\n\nFailure to comply may result in access restrictions.\n\nType "help" to see commands or click the "Help" button below.`,
            buttons: [
              {
                type: "web_url",
                url: "https://privacy-policy-jet-sigma.vercel.app/",
                title: "PRIVACY POLICY"
              }
            ]
          }
        },
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"
          }
        ]
      };

      // Send the welcome message with quick reply options
      sendMessage(chilli, combinedMessage, pageAccessToken);
    } else {
      // If the user sends something else, we can respond with a generic message or handle other commands
      sendMessage(chilli, { text: `You said: ${message}` }, pageAccessToken);
    }
  } else {
    console.error('Invalid message event data');
  }
};

module.exports = { handleMessage };
