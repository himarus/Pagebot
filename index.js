const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const commandsPath = './commands';
let loadedCommands = [];

// Load Commands Only
fs.readdirSync(commandsPath).forEach(file => {
  loadedCommands.push(file.replace('.js', ''));
});

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const { body } = req;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        try {
          if (event.message) {
            console.log(`Received message: ${JSON.stringify(event.message)}`);
            handleMessage(event, PAGE_ACCESS_TOKEN);
            console.log(`Command message: ${event.message.text}`);
          } else if (event.postback) {
            console.log(`Received postback: ${JSON.stringify(event.postback)}`);
            handlePostback(event, PAGE_ACCESS_TOKEN);
            console.log(`Command executed for postback: ${event.postback.payload}`);
          }
        } catch (error) {
          console.error('Error handling command:', error);
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Display Loading Console with Design Only
console.clear();
console.log(`\n\x1b[34m██████╗  █████╗  ██████╗ ███████╗██████╗  ██████╗ ████████╗\n██╔══██╗██╔══██╗██╔════╝ ██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝\n██████╔╝███████║██║  ███╗█████╗  ██████╔╝██║   ██║   ██║   \n██╔═══╝ ██╔══██║██║   ██║██╔══╝  ██╔═══╝ ██║   ██║   ██║   \n██║     ██║  ██║╚██████╔╝███████╗██║     ╚██████╔╝   ██║   \n╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝      ╚═════╝    ╚═╝   \x1b[0m`);
console.log(`\n \x1b[36m> Creator : Churchill Abing\x1b[0m\n`);
console.log(`\x1b[32mLoading ${loadedCommands.length} command(s)...\x1b[0m`);

loadedCommands.forEach(cmd => {
  console.log(`\x1b[32m✔ Command Loaded: ${cmd}\x1b[0m`);
});

console.log(`\n\x1b[32mTotal Commands Loaded: ${loadedCommands.length}/${loadedCommands.length}\x1b[0m`);
console.log(`\x1b[36mLoading Complete: |██████████████████████████| 100.00%\x1b[0m`);
console.log(`\nCHAT LOG:\n`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\x1b[36mServer is running on port ${PORT}\x1b[0m`);
});
