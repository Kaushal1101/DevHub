const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

const accessOrCreateChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 }
    })
      .populate('participants', '-password')
      .populate('latestMessage');

    if (!chat) {
      chat = await Chat.create({ participants: [req.user._id, userId] });
      chat = await chat.populate('participants', '-password');
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to access or create chat' });
  }
};

const fetchMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name username avatar' }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

module.exports = { accessOrCreateChat, fetchMyChats };
