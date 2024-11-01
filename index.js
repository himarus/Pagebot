const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const commandsPath = './commands';
fs.readdirSync(commandsPath).forEach(file => {
  console.log(`Loaded command: ${file}`);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
