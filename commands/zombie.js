const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { sendMessage } = require('./sendMessage');

module.exports = {
  name: 'zombie',
  description: 'Applies a zombie effect to the last image sent by the user',
  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      await sendMessage(senderId, { text: 'No image found to apply the zombie effect.' }, pageAccessToken);
      return;
    }

    // Define paths for downloading and saving the processed image
    const downloadPath = path.join(__dirname, 'temp', `${senderId}_zombie.png`);
    const processedPath = path.join(__dirname, 'temp', `${senderId}_zombie_processed.png`);

    try {
      // Ensure the temp directory exists
      await fs.ensureDir(path.join(__dirname, 'temp'));

      // Download the image
      const response = await axios({
        url: imageUrl,
        responseType: 'stream'
      });
      const writer = fs.createWriteStream(downloadPath);
      response.data.pipe(writer);

      // Wait for the download to complete
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Apply the "zombie" effect (this is where you’d add your image processing logic)
      // For now, assume there's a function applyZombieEffect that modifies the image
      await applyZombieEffect(downloadPath, processedPath);

      // Send the processed image back
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: `file://${processedPath}`,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Clean up the temp files
      await fs.remove(downloadPath);
      await fs.remove(processedPath);

    } catch (error) {
      console.error('Error in zombie command:', error);
      await sendMessage(senderId, { text: 'An error occurred while applying the zombie effect.' }, pageAccessToken);
    }
  }
};

// Mock function for applying zombie effect (replace this with actual image processing logic)
async function applyZombieEffect(inputPath, outputPath) {
  // Simulate processing by copying the input file to the output path
  await fs.copy(inputPath, outputPath);
}
