const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return res.status(400).json({ message: 'chatId and content are required' });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId
    });

    message = await message.populate('sender', 'name username avatar');
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name username avatar')
      .sort('createdAt');

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

module.exports = { sendMessage, getMessages };
