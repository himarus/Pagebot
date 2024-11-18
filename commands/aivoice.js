const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
    name: "aivoice",
    description: "Generate AI voice clips using a text prompt and voice ID.",
    author: "chilli",
    async execute(kupal, pogi, pageAccessToken) {
        if (!pogi || pogi.length === 0) {
            return sendMessage(kupal, {
                text: `❗ Usage: aivoice <text> [id]\n\n💡 Example:\n- aivoice kamustaangbuhaybuhayboss\n- aivoice kamustaangbuhaybuhayboss 1\n\n🔢 Valid IDs: 1-8 (Default: 7)`
            }, pageAccessToken);
        }

        const chilli = pogi.slice(0, -1).join(" ");
        const lastArg = pogi[pogi.length - 1];
        let id = 7;

        if (!isNaN(lastArg) && parseInt(lastArg) >= 1 && parseInt(lastArg) <= 8) {
            id = parseInt(lastArg);
        } else {
            chilli.push(lastArg);
        }

        const apiUrl = `${api.joshWebApi}/aivoice?q=${encodeURIComponent(chilli)}&id=${id}`;

        await sendMessage(kupal, {
            text: `🔊 Generating AI voice for: "${chilli}" with voice ID: ${id}... Please wait.`
        }, pageAccessToken);

        try {
            const response = await axios.get(apiUrl);

            if (response.data.error) {
                return sendMessage(kupal, {
                    text: `❌ Error: ${response.data.error}`
                }, pageAccessToken);
            }

            const audioUrl = apiUrl;
            await sendMessage(kupal, {
                attachment: {
                    type: 'audio',
                    payload: {
                        url: audioUrl
                    }
                }
            }, pageAccessToken);
        } catch (error) {
            await sendMessage(kupal, {
                text: `❌ An error occurred while generating the voice. Please try again later.`
            }, pageAccessToken);
        }
    }
};
