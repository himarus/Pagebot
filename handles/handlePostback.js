
const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (!senderId || !payload) {
    console.error('Invalid postback event data');
    return;
  }

  if (payload === 'WELCOME_MESSAGE') {
    const combinedMessage = {
      text: `🔥 Welcome to CHILLI BOT! 🔥\n\nI'm your AI-powered assistant, here to make things spicier and smoother! 🌶️\n\n𝗧𝗘𝗥𝗠𝗦 𝗢𝗙 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 & 𝗣𝗥𝗜𝗩𝗔𝗖𝗬 𝗣𝗢𝗟𝗜𝗖𝗬\n\nBy using this bot, you agree to:\n1. 𝗜𝗻𝘁𝗲𝗿𝗮𝗰𝘁𝗶𝗼𝗻: Automated responses may log interactions to improve service.\n2. 𝗗𝗮𝘁𝗮: We collect data to enhance functionality without sharing it.\n3. 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: Your data is protected.\n4. 𝗖𝗼𝗺𝗽𝗹𝗶𝗮𝗻𝗰𝗲: Follow Facebook's terms or risk access restrictions.\n5. 𝗨𝗽𝗱𝗮𝘁𝗲𝘀: Terms may change, and continued use implies acceptance.\n\nFailure to comply may result in access restrictions.\n\nType "help" to see commands.`,
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
    const [_, keyword, videoUrl] = payload.split('|');
    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: { url: videoUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error sending video:', error);
      await sendMessage(senderId, {
        text: `Failed to send video. Please try accessing it here: ${videoUrl}`
      }, pageAccessToken);
    }

  } else if (payload.startsWith('quiz_answer::')) {
    const [, selected, correct] = payload.split('::');
    const isCorrect = selected === correct;

    await sendMessage(senderId, {
      text: isCorrect
        ? `✅ Correct! "${selected}" is the right answer.`
        : `❌ Wrong! You chose "${selected}".\nCorrect answer: "${correct}".`
    }, pageAccessToken);

  } else {
    console.log('Unknown payload:', payload);
  }
};

module.exports = { handlePostback };
