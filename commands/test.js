const { sendMessage } = require('../handles/sendMessage');
const axios = require("axios");
const cheerio = require("cheerio");

class Genius {
  constructor(token) {
    this.API = "https://api.genius.com";
    this.TOKEN = token;
    this.headers = {
      Authorization: `Bearer ${this.TOKEN}`,
      "User-Agent": "apitester.org Android/7.5(641)"
    };
  }

  async search(query) {
    const url = new URL("/search", this.API);
    url.searchParams.append("q", query);

    try {
      const { data } = await axios.get(url.toString(), { headers: this.headers });
      return data.response.hits
        .filter(e => e.type === "song")
        .map(({ result }) => ({
          title: result.full_title || "Unknown",
          artist: result.artist_names || "Unknown",
          image: result.song_art_image_url || null,
          url: result.url || null
        }));
    } catch (error) {
      console.error(`${error.response?.status} - ${error.message}`);
      return [];
    }
  }

  async lyrics(url) {
    try {
      const { data: html } = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(html);
      const lyrics = $("#lyrics-root")
        .find("[data-lyrics-container='true']")
        .map((_, el) => {
          $(el).find("br").replaceWith("\n");
          return $(el).text().trim();
        })
        .get()
        .join("\n");

      return { lyrics: lyrics || "Lyrics not found." };
    } catch (error) {
      console.error(`${error.response?.status} - ${error.message}`);
      return { lyrics: "" };
    }
  }
}

module.exports = {
  name: 'test',
  description: 'Fetch clean and styled song lyrics.',
  usage: 'lyrics <song title>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(" ");
    if (!query) {
      return sendMessage(senderId, { text: 'Usage: lyrics <song title>' }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: `🎶 *Searching for:* _${query}_\n_This may take a moment..._`
    }, pageAccessToken);

    const genius = new Genius("OF9-sHAfNsCgto9cGNOvQ12Bt7qOStyoC5wsj5eWlcrdG9f4diQWg9iOiAdyLQL5");

    try {
      const results = await genius.search(query);
      if (!results.length) {
        return sendMessage(senderId, { text: `❌ No lyrics found for *"${query}"*.` }, pageAccessToken);
      }

      const song = results[0];
      const { lyrics } = await genius.lyrics(song.url);

      await sendMessage(senderId, {
        text:
`*🎵 ${song.title}*
*Artist:* ${song.artist}

─────────────────────
${lyrics.trim()}
`
      }, pageAccessToken);

    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ Error: ${error.response?.data?.error?.message || error.message}`
      }, pageAccessToken);
    }
  }
};
