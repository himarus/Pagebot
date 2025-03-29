const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "test",
  description: "Search for a Spotify track and play it",
  author: "churchill",

  async execute(senderId, args, pageAccessToken) {
    const searchQuery = args.join(" ");

    if (!searchQuery) {
      return sendMessage(senderId, {
        text: `Usage: spotify [song title]`
      }, pageAccessToken);
    }

    try {
      // Fetch song data from the API
      const res = await axios.get(`https://api.zetsu.xyz/search/spotify`, {
        params: { q: searchQuery }
      });

      if (!res || !res.data || res.data.result.length === 0) {
        throw new Error("No results found.");
      }

      // Extract up to 10 songs (Messenger limit)
      const songs = res.data.result.slice(0, 10);

      // Prepare elements for generic template
      const elements = songs.map(song => ({
        title: `${song.title} - ${song.artist}`,
        subtitle: `Album: ${song.artist_album} | Released: ${song.album_release_date}`,
        image_url: song.album_url.replace("open.spotify.com/album", "i.scdn.co/image"), // Convert to album cover URL
        default_action: {
          type: "web_url",
          url: song.url,
          webview_height_ratio: "tall"
        },
        buttons: [
          {
            type: "web_url",
            url: song.url,
            title: "View on Spotify"
          },
          {
            type: "postback",
            title: "Play Full Audio",
            payload: JSON.stringify({
              type: "spotify_play",
              track_url: song.full_audio_url // This should point to the full track
            })
          }
        ]
      }));

      // Send generic template with search results
      await sendMessage(senderId, {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: elements
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error retrieving Spotify track:", error);
      sendMessage(senderId, {
        text: `Error retrieving the Spotify track. Please try again.`
      }, pageAccessToken);
    }
  }
};
