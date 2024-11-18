const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: "pastebin",
    description: "Upload files to Pastebin and get a sharable link.",
    author: "chilli",
    async execute(kupal, pogi, pageAccessToken) {
        const chilli = "8731046750250922";

        if (kupal !== chilli) {
            return sendMessage(kupal, {
                text: '❌ You are not authorized to use this command.'
            }, pageAccessToken);
        }

        if (!pogi || pogi.length === 0) {
            return sendMessage(kupal, {
                text: '❗ Please provide a filename to upload. Usage: pastebin <filename>'
            }, pageAccessToken);
        }

        const fileName = pogi[0];
        const filePathWithoutExtension = path.join(__dirname, fileName);
        const filePathWithExtension = path.join(__dirname, fileName + '.js');

        if (!fs.existsSync(filePathWithoutExtension) && !fs.existsSync(filePathWithExtension)) {
            return sendMessage(kupal, {
                text: '❌ File not found. Please provide a valid filename.'
            }, pageAccessToken);
        }

        const filePath = fs.existsSync(filePathWithoutExtension) ? filePathWithoutExtension : filePathWithExtension;

        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return sendMessage(kupal, {
                    text: '❌ Error reading the file. Please try again.'
                }, pageAccessToken);
            }

            try {
                const pastebin = new PastebinAPI({
                    api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
                    api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
                });

                const paste = await pastebin.createPaste({
                    text: data,
                    title: fileName,
                    format: null,
                    privacy: 1,
                });

                const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
                await sendMessage(kupal, {
                    text: `✅ File uploaded successfully: ${rawPaste}`
                }, pageAccessToken);
            } catch (error) {
                console.error("Pastebin error:", error);
                await sendMessage(kupal, {
                    text: '❌ Error uploading the file to Pastebin.'
                }, pageAccessToken);
            }
        });
    }
};
