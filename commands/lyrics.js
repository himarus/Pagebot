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
        text: `❗ Usage: lyrics [song title]\n\nExample: lyrics muli ace`
      }, sili);
    }

    try {
    
      const apiUrl = `${api.mark2}/api/lyrics/song?title=${encodeURIComponent(kanta)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.content) {
        throw new Error("No lyrics found for this song.");
      }

      const { title, artist, lyrics, song_thumbnail, url } = res.data.content;
      const lyricsMessage = `🎵 *${title}* by *${artist}*\n\n${lyrics}\n\n🔗 [View on Genius](${url})`;

      if (song_thumbnail) {
        await sendMessage(kupal, {
          attachment: {
            type: "image",
            payload: {
              url: song_thumbnail
            }
          }
        }, sili);
      }

      await sendMessage(kupal, { text: lyricsMessage }, sili);

    } catch (error) {
      console.error("Error retrieving lyrics:", error.message || error);
      sendMessage(kupal, {
        text: `⚠️ Error retrieving lyrics. Please try again or check your input.`
      }, sili);
    }
  }
};
