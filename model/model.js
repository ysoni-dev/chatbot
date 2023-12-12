
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  content: String,
  type: String, // 'user' or 'bot'
  timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
