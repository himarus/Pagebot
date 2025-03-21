const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'soundcloud',
  description: 'Retrieve an audio track from the Yakzy API for the given search term',
  usage: 'soundcloud <title>',
  author: 'chill',

  async execute(chilli, args, pogi) {
    const search = args.join(' ');

    if (!search || search.trim() === '') {
      await sendMessage(chilli, {
        text: 'Please provide a song title. Example: soundcloud Apt'
      }, pogi);
      return;
    }

    await sendMessage(chilli, {
      text: `🔍 Searching for "${search}" on SoundCloud...`
    }, pogi);

    const musicUrl = `${api.yakzy}/sc?search=${encodeURIComponent(search)}`;

    try {
      const checkAudio = await axios.head(musicUrl);
      const type = checkAudio.headers['content-type'] || '';

      if (type.includes('audio')) {
        await sendMessage(chilli, {
          text: `🎵 Now playing: ${search}`
        }, pogi);

        await sendMessage(chilli, {
          attachment: {
            type: 'audio',
            payload: {
              url: musicUrl
            }
          }
        }, pogi);
      } else {
        await sendMessage(chilli, {
          text: `No audio results found for "${search}".`
        }, pogi);
      }
    } catch (error) {
      await sendMessage(chilli, {
        text: '⚠️ An error occurred while trying to retrieve the audio.'
      }, pogi);
    }
  }
};
