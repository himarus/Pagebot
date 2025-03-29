const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (senderId && payload) {
    if (payload === 'GET_STARTED_PAYLOAD') {
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

      await sendMessage(senderId, combinedMessage, pageAccessToken);
    } else if (payload.startsWith('WATCH_VIDEO_PAYLOAD|')) {
      const videoUrl = payload.split('|')[1];

      try {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl
            }
          }
        }, pageAccessToken);

        console.log('Video sent successfully!');
      } catch (error) {
        console.error('Error sending video:', error);
        await sendMessage(senderId, {
          text: 'Failed to send video. Please try again.'
        }, pageAccessToken);
      }
    } else {
      console.log('Unknown payload:', payload);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };
