const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "lyrics",
  description: "Get song lyrics by title",
  author: "chilli",

  async execute(kupal, pogi, sili) {
    const kanta = pogi.join(" ");

    if (!kanta) {
      return sendMessage(kupal, {
        text: `Usage: lyrics [song title]`
      }, sili);
    }

    try {
      const res = await axios.get(`${api.joshWebApi}/search/lyrics`, {
        params: { q: kanta }
      });

      if (!res.data || !res.data.result) {
        throw new Error("No lyrics found for this song.");
      }

      const { title, artist, lyrics, image } = res.data.result;
      const lyricsMessage = `🎵 *${title}* by *${artist}*\n\n${lyrics}`;

      await sendConcatenatedMessage(kupal, lyricsMessage, sili);

      if (image) {
        setTimeout(async () => {
          await sendMessage(kupal, {
            attachment: {
              type: "image",
              payload: {
                url: image
              }
            }
          }, sili);
        }, 1000);
      }

    } catch (error) {
      console.error("Error retrieving lyrics:", error);
      sendMessage(kupal, {
        text: `Error retrieving lyrics. Please try again or check your input.`
      }, sili);
    }
  }
};

async function sendConcatenatedMessage(kupal, text, sili) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage(kupal, { text: message }, sili);
    }
  } else {
    await sendMessage(kupal, { text }, sili);
  }
}

function splitMessageIntoChunks(mensahe, laki) {
  const chunks = [];
  for (let i = 0; i < mensahe.length; i += laki) {
    chunks.push(mensahe.slice(i, i + laki));
  }
  return chunks;
}
