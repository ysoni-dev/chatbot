const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const ChatMessage = require('./model/model');
const database = require('./db/db')
require('dotenv').config()
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cors = require('cors')
const PORT = process.env.PORT || 3001;


const OPENAI_API_KEY = process.env.OPENAI_API_KEY


app.use(express.json());
app.use(cors())


app.get('/',(req,res)=>{
  res.send('helo')
})

app.post('/openai', async function(req,res){
  try {
      await chatBot(req,res)
  } catch (error) {
    console.log(error)
        res.status(400).json({ error: 'error processing chatbot' })
  }
})

let chatBot = async (req, res) => {
  const { message } = req.body;
  const maxRetries = 3; 
  const retryDelay = 1000; 

  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/text-davinci-002/completions',
        {
          prompt: message,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      // Save user's message to MongoDB
    const userMessage = new ChatMessage({ content: message, type: 'user' });
    await userMessage.save();

    // Save bot's reply to MongoDB
    const botReply = new ChatMessage({ content: response.data.choices[0].text.trim(), type: 'bot' });
    await botReply.save();

    return res.json({ reply: botReply.content });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Retry after a constant delay
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
    }
  }

  res.status(429).json({ error: 'Too Many Requests, please try again later' });
};



app.get('/history',async function(req,res){
    try {
      await getChatData(req,res)
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "error fetching data" })
    }
  })


let getChatData = async(req,res)=>{
  try {
    const data = await ChatMessage.find()
    if (!data || data.length <= 0) {
      return res.status(400).send('data not present')
  }
  res.status(200).send(data)
  } catch (error) {
    console.log(error)
        res.status(500).json({ message: "error fetching user data" })
  }
 
}

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected');


  socket.on('chat message', async (message) => {
    io.emit('chat message', message); 
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
