const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "pastebin",
    description: "Upload files to Pastebin and get a sharable link.",
    author: "chilli",
    async execute(senderId, args, pageAccessToken, event) {
        
        const allowedUserID = "8731046750250922";

        if (senderId !== allowedUserID) {
            return require('../handles/sendMessage').sendMessage(senderId, {
                text: '❌ You are not authorized to use this command.'
            }, pageAccessToken);
        }

        const pastebin = new PastebinAPI({
            api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
            api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
        });

        const fileName = args[0];
        const filePathWithoutExtension = path.join(__dirname, fileName);
        const filePathWithExtension = path.join(__dirname, fileName + '.js');

        if (!fs.existsSync(filePathWithoutExtension) && !fs.existsSync(filePathWithExtension)) {
            return require('../handles/sendMessage').sendMessage(senderId, {
                text: '❌ File not found. Please provide a valid filename.'
            }, pageAccessToken);
        }

        const filePath = fs.existsSync(filePathWithoutExtension) ? filePathWithoutExtension : filePathWithExtension;

        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return require('../handles/sendMessage').sendMessage(senderId, {
                    text: '❌ Error reading the file. Please try again.'
                }, pageAccessToken);
            }

            try {
                const paste = await pastebin.createPaste({
                    text: data,
                    title: fileName,
                    format: null,
                    privacy: 1, // 1: Public, 2: Unlisted, 3: Private
                });

                const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
                require('../handles/sendMessage').sendMessage(senderId, {
                    text: `✅ File uploaded successfully: ${rawPaste}`
                }, pageAccessToken);
            } catch (error) {
                console.error("Pastebin error:", error);
                require('../handles/sendMessage').sendMessage(senderId, {
                    text: '❌ Error uploading the file to Pastebin.'
                }, pageAccessToken);
            }
        });
    }
};
