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

      if (image) {
        await sendMessage(kupal, {
          attachment: {
            type: "image",
            payload: {
              url: image
            }
          }
        }, sili);
      }

      await sendMessage(kupal, { text: lyricsMessage }, sili);

    } catch (error) {
      console.error("Error retrieving lyrics:", error);
      sendMessage(kupal, {
        text: `Error retrieving lyrics. Please try again or check your input.`
      }, sili);
    }
  }
};
