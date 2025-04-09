const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (senderId && payload) {
    if (payload === 'WELCOME_MESSAGE') {
      const combinedMessage = {
        text: `🔥 Welcome to CHILLI BOT! 🔥\n\nI'm your AI-powered assistant, here to make things spicier and smoother! 🌶️\n\nTERMS OF SERVICE & PRIVACY POLICY\n\nBy using this bot, you agree to:\n1. INTERACTION: Automated responses may log interactions to improve service.\n2. DATA: We collect data to enhance functionality without sharing it.\n3. SECURITY: Your data is protected.\n4. COMPLIANCE: Follow Facebook's terms or risk access restrictions.\n5. UPDATES: Terms may change, and continued use implies acceptance.\n\nFailure to comply may result in access restrictions.\n\nType "help" to see commands.`,
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
            payload: {
              url: videoUrl
            }
          }
        }, pageAccessToken);

        console.log(`Video sent successfully for search query: ${keyword}`);
      } catch (error) {
        console.error('Error sending video:', error);
        await sendMessage(senderId, {
          text: `Failed to send video. Please try accessing it here: ${videoUrl}`
        }, pageAccessToken);
      }
    } else if (payload.startsWith('QUIZ_ANSWER')) {
      const [_, userAnswer, correctAnswer] = payload.split('|');
      
      const resultText = (userAnswer === correctAnswer) 
        ? '🎉 Correct! Well done!' 
        : `❌ Incorrect. The correct answer was ${correctAnswer}`;

      const quickReplies = {
        text: `${resultText}\n\nWant another question?`,
        quick_replies: [
          { content_type: "text", title: "♻️ New Question", payload: "NEW_QUIZ" },
          { content_type: "text", title: "🚫 Quit", payload: "QUIT_QUIZ" }
        ]
      };

      await sendMessage(senderId, quickReplies, pageAccessToken);
    } else if (payload === 'NEW_QUIZ') {
      await sendMessage(senderId, { text: '🔄 Loading a new question...' }, pageAccessToken);
      
      const quizModule = require('./quiz');
      await quizModule.execute(senderId, [], pageAccessToken);
    } else if (payload === 'QUIT_QUIZ') {
      await sendMessage(senderId, { text: 'Thanks for playing! 😊' }, pageAccessToken);
    } else if (payload === 'HELP_PAYLOAD') {
      await sendMessage(senderId, {
        text: 'Available commands:\n1. quiz - Play a quiz game\n2. help - Show this message\n3. [Other commands...]',
        quick_replies: [
          { content_type: "text", title: "Quiz", payload: "NEW_QUIZ" }
        ]
      }, pageAccessToken);
    } else {
      console.log('Unknown payload:', payload);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };
