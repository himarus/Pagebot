const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const sessions = {};

module.exports = {
  name: 'quiz',
  description: 'Start a quiz with quick replies',
  usage: 'quiz',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, rawMessage) {
    const text = rawMessage?.text?.trim();

    if (sessions[senderId]) {
      const correct = sessions[senderId].correct;

      if (text?.toLowerCase() === 'exit quiz') {
        await sendMessage(senderId, { text: '🛑 Quiz ended. Come back anytime!' }, pageAccessToken);
        delete sessions[senderId];
        return;
      }

      if (text?.toLowerCase() !== 'exit quiz') {
        const answer = text.toLowerCase();

        if (answer === sessions[senderId].correct.toLowerCase()) {
          await sendMessage(senderId, {
            text: `✅ Correct! Want another one?`,
            quick_replies: [
              { content_type: "text", title: "More Question", payload: "quiz" },
              { content_type: "text", title: "Exit Quiz", payload: "exit_quiz" }
            ]
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, {
            text: `❌ Wrong! The correct answer was: ${sessions[senderId].correct}\nTry again?`,
            quick_replies: [
              { content_type: "text", title: "More Question", payload: "quiz" },
              { content_type: "text", title: "Exit Quiz", payload: "exit_quiz" }
            ]
          }, pageAccessToken);
        }
        delete sessions[senderId];
        return;
      }
    }

    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = res.data.results[0];

      const question = decodeHTMLEntities(data.question);
      const correct = decodeHTMLEntities(data.correct_answer);
      const incorrect = data.incorrect_answers.map(a => decodeHTMLEntities(a));

      const choices = [...incorrect, correct].sort(() => Math.random() - 0.5);

      sessions[senderId] = {
        question,
        correct
      };

      await sendMessage(senderId, {
        text: `🧠 Quiz Time!\n\n${question}`,
        quick_replies: choices.map(choice => ({
          content_type: "text",
          title: choice,
          payload: choice
        }))
      }, pageAccessToken);
    } catch (err) {
      console.error("Quiz error:", err);
      await sendMessage(senderId, {
        text: '⚠️ Failed to load quiz. Try again later.'
      }, pageAccessToken);
    }
  }
};

function decodeHTMLEntities(text) {
  return text.replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>');
}
